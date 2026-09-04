package com.camtix.transactionservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectPaymentRequest {

    @NotBlank(message = "Admin note is required for rejection")
    private String adminNote;
}
