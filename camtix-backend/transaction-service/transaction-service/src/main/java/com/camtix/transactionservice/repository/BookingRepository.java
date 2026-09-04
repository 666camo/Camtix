package com.camtix.transactionservice.repository;

import com.camtix.transactionservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByUserId(Long userId);
    long countByBookingDateAfter(LocalDateTime dateTime);
    List<Booking> findByBookingStatusAndExpiredAtBefore(String status, LocalDateTime dateTime);
}
