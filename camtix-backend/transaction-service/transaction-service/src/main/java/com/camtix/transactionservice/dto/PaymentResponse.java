package com.camtix.transactionservice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long idPayment;
    private Long bookingId;
    private Long paymentMethodId;
    private BigDecimal totalPayment;
    private String paymentStatus;
    private String paymentProof;
    private LocalDateTime paymentDate;
    private LocalDateTime verifiedAt;
    private String adminNote;
    private String snapToken;
    private String midtransOrderId;
}
