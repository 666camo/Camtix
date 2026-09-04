package com.camtix.userservice.config;

import com.camtix.userservice.entity.User;
import com.camtix.userservice.repository.UserRepository;
import com.camtix.userservice.repository.VisitorRepository;
import com.camtix.userservice.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final VisitorRepository visitorRepository;
        private final OtpVerificationRepository otpVerificationRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() > 0) {
                        log.info("User database already has data. Skipping seeder to preserve existing users.");
                        return;
                }

                log.info("Resetting user database: clearing existing visitors, OTPs, and users...");
                visitorRepository.deleteAll();
                otpVerificationRepository.deleteAll();
                userRepository.deleteAll();

                log.info("Seeding new presentation User data...");

                User adminApp = User.builder()
                                .firstName("Admin")
                                .lastName("Aplikasi")
                                .age(30)
                                .address("Gedung CamTix Lt. 10, Jakarta")
                                .phone("08111111111")
                                .email("adminapp@camtix.com")
                                .password(passwordEncoder.encode("admin123"))
                                .role("ADMIN_APLIKASI")
                                .isVerified(true)
                                .isBanned(false)
                                .build();

                User adminCamTix = User.builder()
                                .firstName("Admin")
                                .lastName("CamTix")
                                .age(28)
                                .address("HQ CamTix, Bandung")
                                .phone("08222222222")
                                .email("admin@camtix.com")
                                .password(passwordEncoder.encode("admin123"))
                                .role("ADMIN_CAMTIX")
                                .isVerified(true)
                                .isBanned(false)
                                .build();

                User regularUser = User.builder()
                                .firstName("Budi")
                                .lastName("Santoso")
                                .age(24)
                                .address("Jl. Merdeka No. 45, Jakarta")
                                .phone("08333333333")
                                .email("user@camtix.com")
                                .password(passwordEncoder.encode("user123"))
                                .role("USER")
                                .isVerified(true)
                                .isBanned(false)
                                .build();

                User regularUser2 = User.builder()
                                .firstName("Bambang")
                                .lastName("Pamungkas")
                                .age(35)
                                .address("Kebayoran Baru, Jakarta")
                                .phone("08555555555")
                                .email("bambang@camtix.com")
                                .password(passwordEncoder.encode("user123"))
                                .role("USER")
                                .isVerified(true)
                                .isBanned(false)
                                .build();

                User regularUser3 = User.builder()
                                .firstName("Clara")
                                .lastName("Sutedja")
                                .age(22)
                                .address("Dago, Bandung")
                                .phone("08666666666")
                                .email("clara@camtix.com")
                                .password(passwordEncoder.encode("user123"))
                                .role("USER")
                                .isVerified(true)
                                .isBanned(false)
                                .build();

                userRepository.saveAll(Arrays.asList(adminApp, adminCamTix, regularUser, regularUser2, regularUser3));
                log.info("User database successfully seeded for presentation!");
        }
}
