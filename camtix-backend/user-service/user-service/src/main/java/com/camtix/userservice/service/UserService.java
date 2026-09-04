package com.camtix.userservice.service;

import com.camtix.userservice.entity.User;
import com.camtix.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<User> getAllUsersPaged(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    @Transactional
    public void banUser(Long id, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin account not found"));
        User target = getUserById(id);

        if (caller.getIdUser().equals(target.getIdUser())) {
            throw new IllegalArgumentException("Anda tidak dapat memblokir akun Anda sendiri");
        }

        if ("ADMIN_APLIKASI".equals(caller.getRole())) {
            if (!List.of("ADMIN_CAMTIX", "USER").contains(target.getRole())) {
                throw new IllegalArgumentException("Anda tidak memiliki wewenang memblokir sesama Admin Aplikasi");
            }
        } else if ("ADMIN_CAMTIX".equals(caller.getRole())) {
            if (!"USER".equals(target.getRole())) {
                throw new IllegalArgumentException("Anda tidak memiliki wewenang memblokir akun Admin");
            }
        } else {
            throw new IllegalArgumentException("Aksi tidak diizinkan");
        }

        if (Boolean.TRUE.equals(target.getIsBanned())) {
            throw new IllegalArgumentException("User is already banned");
        }
        target.setIsBanned(true);
        userRepository.save(target);
    }

    @Transactional
    public void unbanUser(Long id, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin account not found"));
        User target = getUserById(id);

        if (caller.getIdUser().equals(target.getIdUser())) {
            throw new IllegalArgumentException("Anda tidak dapat membuka blokir akun Anda sendiri");
        }

        if ("ADMIN_APLIKASI".equals(caller.getRole())) {
            if (!List.of("ADMIN_CAMTIX", "USER").contains(target.getRole())) {
                throw new IllegalArgumentException("Anda tidak memiliki wewenang membuka blokir sesama Admin Aplikasi");
            }
        } else if ("ADMIN_CAMTIX".equals(caller.getRole())) {
            if (!"USER".equals(target.getRole())) {
                throw new IllegalArgumentException("Anda tidak memiliki wewenang membuka blokir akun Admin");
            }
        } else {
            throw new IllegalArgumentException("Aksi tidak diizinkan");
        }

        if (Boolean.FALSE.equals(target.getIsBanned())) {
            throw new IllegalArgumentException("User is not banned");
        }
        target.setIsBanned(false);
        userRepository.save(target);
    }
}
