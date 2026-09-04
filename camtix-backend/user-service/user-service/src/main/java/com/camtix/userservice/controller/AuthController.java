package com.camtix.userservice.controller;

import com.camtix.userservice.dto.*;
import com.camtix.userservice.entity.User;
import com.camtix.userservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<WebResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        WebResponse<User> response = WebResponse.<User>builder()
                .status(true)
                .message("Registration successful. OTP code has been sent to your email.")
                .data(user)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<WebResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("OTP verification successful. Your account is now verified.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<WebResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request.getEmail());
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("A new OTP code has been sent to your email.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<WebResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse loginResponse = authService.login(request);
        WebResponse<LoginResponse> response = WebResponse.<LoginResponse>builder()
                .status(true)
                .message("Login successful.")
                .data(loginResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<WebResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("Instructions to reset your password have been sent to your email.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<WebResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("Your password has been successfully reset.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google-login")
    public ResponseEntity<WebResponse<LoginResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        LoginResponse loginResponse = authService.googleLogin(request);
        WebResponse<LoginResponse> response = WebResponse.<LoginResponse>builder()
                .status(true)
                .message("Google authentication successful.")
                .data(loginResponse)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<WebResponse<LoginResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse loginResponse = authService.refreshToken(request);
        WebResponse<LoginResponse> response = WebResponse.<LoginResponse>builder()
                .status(true)
                .message("Token refreshed successfully.")
                .data(loginResponse)
                .build();
        return ResponseEntity.ok(response);
    }
}
