package com.camtix.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResendOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;
}
