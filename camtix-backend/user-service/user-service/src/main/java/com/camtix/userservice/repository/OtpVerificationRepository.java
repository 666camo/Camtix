package com.camtix.userservice.repository;

import com.camtix.userservice.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpCodeAndIsUsedFalse(String email, String otpCode);
    List<OtpVerification> findByExpiredAtBeforeAndIsUsedFalse(LocalDateTime dateTime);
    void deleteByEmail(String email);
}
