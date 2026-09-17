package com.camtix.userservice.service;

import com.camtix.userservice.dto.UpdateUserRequest;
import com.camtix.userservice.entity.User;
import com.camtix.userservice.exception.ResourceNotFoundException;
import com.camtix.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<User> getAllUsersPaged(String search, String role, Pageable pageable) {
        String normalizedSearch = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String normalizedRole = (role == null || role.trim().isEmpty()) ? null : role.trim();

        if (normalizedSearch != null || normalizedRole != null) {
            return userRepository.searchUsers(normalizedSearch, normalizedRole, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    @Transactional
    public User updateUser(Long id, UpdateUserRequest request) {
        User user = getUserById(id);

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        return userRepository.save(user);
    }

    @Transactional
    public User patchUser(Long id, Map<String, Object> updates) {
        User user = getUserById(id);

        updates.forEach((key, value) -> {
            switch (key) {
                case "firstName" -> user.setFirstName((String) value);
                case "lastName" -> user.setLastName((String) value);
                case "age" -> user.setAge(value instanceof Number ? ((Number) value).intValue() : null);
                case "address" -> user.setAddress((String) value);
                case "phone" -> user.setPhone((String) value);
                case "email" -> {
                    String newEmail = (String) value;
                    if (newEmail != null && !newEmail.equals(user.getEmail())) {
                        if (userRepository.findByEmail(newEmail).isPresent()) {
                            throw new IllegalArgumentException("Email already in use: " + newEmail);
                        }
                        user.setEmail(newEmail);
                    }
                }
            }
        });

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public void banUser(Long id, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
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
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
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
