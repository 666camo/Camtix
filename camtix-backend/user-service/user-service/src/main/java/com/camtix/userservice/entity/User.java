package com.camtix.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private Integer age;
    private String address;
    private String phone;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;
    private String role;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @Column(name = "is_banned")
    private Boolean isBanned;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expired_at")
    private LocalDateTime resetPasswordTokenExpiredAt;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "refresh_token_expired_at")
    private LocalDateTime refreshTokenExpiredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
