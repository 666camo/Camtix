package com.camtix.transactionservice.repository;

import com.camtix.transactionservice.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT b FROM Booking b WHERE " +
            "(:search IS NULL OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR b.bookingStatus = :status) AND " +
            "(:userId IS NULL OR b.userId = :userId)")
    Page<Booking> findWithFilters(
            @Param("search") String search,
            @Param("status") String status,
            @Param("userId") Long userId,
            Pageable pageable
    );
}
