package com.camtix.transactionservice.scheduler;

import com.camtix.transactionservice.entity.Booking;
import com.camtix.transactionservice.entity.Payment;
import com.camtix.transactionservice.repository.BookingRepository;
import com.camtix.transactionservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${event.service.url}")
    private String eventServiceUrl;

    @Scheduled(fixedRate = 60000) // Run every 1 minute
    @Transactional
    public void cancelExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        // Fetch all PENDING bookings that have expired
        List<Booking> expiredBookings = bookingRepository.findByBookingStatusAndExpiredAtBefore("PENDING", now);

        if (!expiredBookings.isEmpty()) {
            for (Booking booking : expiredBookings) {
                // Cancel booking
                booking.setBookingStatus("CANCELLED");
                bookingRepository.save(booking);

                // Expire associated payment if it's still in PENDING status
                paymentRepository.findByBookingId(booking.getIdBooking()).ifPresent(payment -> {
                    if ("PENDING".equals(payment.getPaymentStatus())) {
                        payment.setPaymentStatus("EXPIRED");
                        paymentRepository.save(payment);
                        log.info("Scheduler: Expired pending payment linked to Booking code {}", booking.getBookingCode());
                    }
                });

                // Restore ticket stock in event-service
                try {
                    String url = eventServiceUrl + "/api/tickets/" + booking.getTicketId() + "/restore-stock?quantity=" + booking.getNumberOfTicket();
                    restTemplate.put(url, null);
                    log.info("Scheduler: Restored {} ticket(s) to event-service for expired Booking code {}", booking.getNumberOfTicket(), booking.getBookingCode());
                } catch (Exception e) {
                    log.error("Scheduler: Failed to restore ticket stock for expired Booking code {}: {}", booking.getBookingCode(), e.getMessage());
                }
            }
            log.info("Scheduler: Automatically cancelled {} expired pending bookings.", expiredBookings.size());
        }
    }
}
