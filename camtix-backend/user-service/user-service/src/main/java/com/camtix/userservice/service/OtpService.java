package com.camtix.userservice.service;

import com.camtix.userservice.entity.OtpVerification;
import com.camtix.userservice.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public OtpVerification generateOtp(String email) {
        // Generate a 6-digit random code
        String otpCode = String.format("%06d", secureRandom.nextInt(1000000));

        // Create OTP Verification entity with 5-minute expiration
        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otpCode(otpCode)
                .expiredAt(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();

        return otpVerificationRepository.save(otpVerification);
    }

    @Transactional
    public void verifyOtp(String email, String otpCode) {
        // Find unused OTP
        OtpVerification otp = otpVerificationRepository.findByEmailAndOtpCodeAndIsUsedFalse(email, otpCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP code or OTP already used"));

        // Check if expired
        if (LocalDateTime.now().isAfter(otp.getExpiredAt())) {
            throw new IllegalArgumentException("OTP code has expired");
        }

        // Mark as used
        otp.setIsUsed(true);
        otpVerificationRepository.save(otp);
    }
}
