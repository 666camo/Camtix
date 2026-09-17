package com.camtix.transactionservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Column(name = "booking_id", insertable = false, updatable = false)
    private Long bookingId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    @JsonBackReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Booking booking;

    @Column(name = "payment_method_id")
    private Long paymentMethodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PaymentMethod paymentMethod;

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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
