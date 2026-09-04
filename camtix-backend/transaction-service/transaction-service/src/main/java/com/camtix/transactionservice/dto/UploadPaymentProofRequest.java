package com.camtix.transactionservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadPaymentProofRequest {

    @NotBlank(message = "Payment proof is required")
    private String paymentProof;
}
