package com.camtix.transactionservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodRequest {

    @NotBlank(message = "Method name is required")
    private String methodName;

    @NotBlank(message = "Provider is required")
    private String provider;

    private String accountNumber;

    @NotBlank(message = "Account name is required")
    private String accountName;

    private String qrImage;

    private Boolean isActive;
}
