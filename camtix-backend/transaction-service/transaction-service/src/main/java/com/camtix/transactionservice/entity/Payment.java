package com.camtix.transactionservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_payment")
    private Long idPayment;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "payment_method_id")
    private Long paymentMethodId;

    @Column(name = "total_payment")
    private BigDecimal totalPayment;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "payment_proof", columnDefinition = "TEXT")
    private String paymentProof;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "admin_note")
    private String adminNote;

    @Column(name = "snap_token", columnDefinition = "TEXT")
    private String snapToken;

    @Column(name = "midtrans_order_id")
    private String midtransOrderId;
}
