package com.camtix.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_otp")
    private Long idOtp;

    private String email;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "is_used")
    private Boolean isUsed;
}
