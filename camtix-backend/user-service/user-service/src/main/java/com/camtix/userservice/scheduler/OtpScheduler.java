package com.camtix.userservice.scheduler;

import com.camtix.userservice.entity.OtpVerification;
import com.camtix.userservice.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OtpScheduler {

    private final OtpVerificationRepository otpVerificationRepository;

    @Scheduled(fixedRate = 60000) // Run every 1 minute
    @Transactional
    public void invalidateExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        List<OtpVerification> expiredOtps = otpVerificationRepository.findByExpiredAtBeforeAndIsUsedFalse(now);

        if (!expiredOtps.isEmpty()) {
            for (OtpVerification otp : expiredOtps) {
                otp.setIsUsed(true); // logically mark as used/expired
            }
            otpVerificationRepository.saveAll(expiredOtps);
            log.info("Scheduler: Logically invalidated {} expired OTP verification codes.", expiredOtps.size());
        }

        // Purge expired OTPs older than 1 day to prevent database bloat
        LocalDateTime oneDayAgo = now.minusDays(1);
        List<OtpVerification> oldOtps = otpVerificationRepository.findByExpiredAtBeforeAndIsUsedFalse(oneDayAgo);
        if (!oldOtps.isEmpty()) {
            otpVerificationRepository.deleteAll(oldOtps);
            log.info("Scheduler: Purged {} old expired OTP records from database.", oldOtps.size());
        }
    }
}
