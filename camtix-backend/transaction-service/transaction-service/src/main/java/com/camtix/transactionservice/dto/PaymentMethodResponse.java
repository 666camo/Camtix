package com.camtix.transactionservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodResponse {
    private Long idPaymentMethod;
    private String methodName;
    private String provider;
    private String accountNumber;
    private String accountName;
    private String qrImage;
    private Boolean isActive;
}
