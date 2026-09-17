package com.camtix.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    @Min(value = 1, message = "Age must be at least 1")
    private Integer age;
    private String address;
    private String phone;
    @Email(message = "Invalid email format")
    private String email;
}
