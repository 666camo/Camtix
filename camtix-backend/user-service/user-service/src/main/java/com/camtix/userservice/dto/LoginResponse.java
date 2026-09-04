package com.camtix.userservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String refreshToken;
    private Long idUser;
    private String email;
    private String role;
    private String fullName;
}
