package com.camtix.transactionservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_methods")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_payment_method")
    private Long idPaymentMethod;

    @Column(name = "method_name")
    private String methodName;

    private String provider;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "account_name")
    private String accountName;

    @Column(name = "qr_image", columnDefinition = "TEXT")
    private String qrImage;

    @Column(name = "is_active")
    private Boolean isActive;
}
