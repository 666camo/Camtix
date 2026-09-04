package com.camtix.userservice.service;

import com.camtix.userservice.dto.*;
import com.camtix.userservice.entity.OtpVerification;
import com.camtix.userservice.entity.User;
import com.camtix.userservice.repository.OtpVerificationRepository;
import com.camtix.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public User register(RegisterRequest request) {
        // Check if email already exists
        var existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (Boolean.TRUE.equals(existing.getIsVerified())) {
                // Email is already verified — reject re-registration
                throw new IllegalArgumentException("Email is already registered");
            }
            // Email exists but NOT verified — allow re-registration
            // Clean up old OTP records and delete the unverified user
            otpVerificationRepository.deleteByEmail(existing.getEmail());
            userRepository.delete(existing);
            userRepository.flush();
        }

        // Create new User entity
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .age(request.getAge())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .isVerified(false)
                .isBanned(false)
                .build();

        User savedUser = userRepository.save(user);

        // Generate OTP code
        OtpVerification otp = otpService.generateOtp(savedUser.getEmail());

        // Send OTP via Email
        emailService.sendOtpEmail(savedUser.getEmail(), otp.getOtpCode());

        return savedUser;
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        // Validate user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is already verified
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new IllegalArgumentException("User is already verified");
        }

        // Verify OTP code rules
        otpService.verifyOtp(request.getEmail(), request.getOtpCode());

        // Update user verification status
        user.setIsVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendOtp(String email) {
        // Validate user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is already verified
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new IllegalArgumentException("User is already verified");
        }

        // Generate new OTP code
        OtpVerification otp = otpService.generateOtp(email);

        // Resend OTP via Email
        emailService.sendOtpEmail(email, otp.getOtpCode());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Validate user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email is not registered"));

        // Match passwords
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        // Check if user is verified
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new IllegalArgumentException("Account is not verified. Please verify using OTP first.");
        }

        // Check if user is banned
        if (Boolean.TRUE.equals(user.getIsBanned())) {
            throw new IllegalArgumentException("Account has been banned.");
        }

        // Generate Refresh Token
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiredAt(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        // Load spring user details context
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        // Prepare JWT payload
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("idUser", user.getIdUser());
        extraClaims.put("role", user.getRole());
        extraClaims.put("fullName", user.getFirstName() + " " + user.getLastName());

        // Generate token
        String token = jwtService.generateToken(userDetails, extraClaims);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .idUser(user.getIdUser())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email is not registered"));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiredAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendResetPasswordEmail(user.getEmail(), token, resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (user.getResetPasswordTokenExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiredAt(null);
        userRepository.save(user);
    }

    @Transactional
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        String tokeninfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getCredential();
        RestTemplate restTemplate = new RestTemplate();
        Map<?, ?> payload;
        try {
            payload = restTemplate.getForObject(tokeninfoUrl, Map.class);
        } catch (Exception e) {
            log.error("Google token validation failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid Google credential");
        }

        if (payload == null || !payload.containsKey("email")) {
            throw new IllegalArgumentException("Invalid Google token payload");
        }

        String email = (String) payload.get("email");
        String rawFirstName = (String) payload.get("given_name");
        String rawLastName = (String) payload.get("family_name");
        String firstName = rawFirstName != null ? rawFirstName : "Google";
        String lastName = rawLastName != null ? rawLastName : "User";

        // Check if user exists. If not, auto-register them.
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .role("USER")
                    .isVerified(true)
                    .isBanned(false)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                    .build();
            return userRepository.save(newUser);
        });

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            throw new IllegalArgumentException("Account has been banned.");
        }

        // Keep dynamic verify status update if was unverified register
        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            user.setIsVerified(true);
            userRepository.save(user);
        }

        // Generate Refresh Token
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiredAt(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("idUser", user.getIdUser());
        extraClaims.put("role", user.getRole());
        extraClaims.put("fullName", user.getFirstName() + " " + user.getLastName());

        String jwtToken = jwtService.generateToken(userDetails, extraClaims);

        return LoginResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .idUser(user.getIdUser())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (user.getRefreshTokenExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token has expired. Please login again.");
        }

        // Rotate Refresh Token
        String newRefreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiredAt(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("idUser", user.getIdUser());
        extraClaims.put("role", user.getRole());
        extraClaims.put("fullName", user.getFirstName() + " " + user.getLastName());

        String newJwtToken = jwtService.generateToken(userDetails, extraClaims);

        return LoginResponse.builder()
                .token(newJwtToken)
                .refreshToken(newRefreshToken)
                .idUser(user.getIdUser())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .build();
    }
}
