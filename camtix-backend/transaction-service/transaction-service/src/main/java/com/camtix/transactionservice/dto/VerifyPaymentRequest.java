package com.camtix.transactionservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequest {
    private String adminNote;
}
