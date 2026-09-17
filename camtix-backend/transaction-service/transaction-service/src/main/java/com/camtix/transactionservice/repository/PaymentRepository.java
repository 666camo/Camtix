package com.camtix.transactionservice.repository;

import com.camtix.transactionservice.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByMidtransOrderId(String midtransOrderId);

    @Query("SELECT p FROM Payment p WHERE " +
            "(:status IS NULL OR p.paymentStatus = :status) AND " +
            "(:paymentMethodId IS NULL OR p.paymentMethodId = :paymentMethodId)")
    Page<Payment> findWithFilters(
            @Param("status") String status,
            @Param("paymentMethodId") Long paymentMethodId,
            Pageable pageable
    );
}
