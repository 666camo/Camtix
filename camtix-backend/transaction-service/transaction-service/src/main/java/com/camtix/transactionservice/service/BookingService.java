package com.camtix.transactionservice.service;

import com.camtix.transactionservice.dto.BookingRequest;
import com.camtix.transactionservice.dto.BookingResponse;
import com.camtix.transactionservice.entity.Booking;
import com.camtix.transactionservice.exception.ResourceNotFoundException;
import com.camtix.transactionservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${event.service.url}")
    private String eventServiceUrl;
    private static final List<String> ALLOWED_STATUSES = Arrays.asList("PENDING", "CONFIRMED", "CANCELLED");

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookingsPaged(String search, String status, Long userId, Pageable pageable) {
        String s = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String st = (status == null || status.trim().isEmpty()) ? null : status.trim().toUpperCase();
        return bookingRepository.findWithFilters(s, st, userId, pageable)
                .map(this::mapToBookingResponse);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return mapToBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueSuffix = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String bookingCode = "CTX-" + dateStr + "-" + uniqueSuffix;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiredAt = now.plusMinutes(30);

        try {
            String url = eventServiceUrl + "/api/tickets/" + request.getTicketId() + "/reduce-stock?quantity=" + request.getNumberOfTicket();
            restTemplate.put(url, null);
        } catch (org.springframework.web.client.HttpClientErrorException ex) {
            String errorMsg = ex.getResponseBodyAsString();
            if (errorMsg.contains("\"message\":\"")) {
                int start = errorMsg.indexOf("\"message\":\"") + 11;
                int end = errorMsg.indexOf("\"", start);
                if (end > start) {
                    throw new IllegalArgumentException(errorMsg.substring(start, end));
                }
            }
            throw new IllegalArgumentException("Stok tiket tidak mencukupi atau tiket tidak ditemukan.");
        } catch (Exception e) {
            throw new IllegalArgumentException("Koneksi ke Event Service gagal: " + e.getMessage());
        }

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .ticketId(request.getTicketId())
                .numberOfTicket(request.getNumberOfTicket())
                .totalPrice(request.getTotalPrice())
                .bookingStatus("PENDING")
                .bookingDate(now)
                .expiredAt(expiredAt)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(savedBooking);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be empty");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid booking status. Allowed: " + ALLOWED_STATUSES);
        }

        booking.setBookingStatus(normalizedStatus);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(updatedBooking);
    }

    @Transactional
    public BookingResponse patchBooking(Long id, Map<String, Object> updates) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        updates.forEach((key, value) -> {
            switch (key) {
                case "bookingStatus" -> {
                    String status = ((String) value).toUpperCase();
                    if (!ALLOWED_STATUSES.contains(status)) {
                        throw new IllegalArgumentException("Invalid booking status. Allowed: " + ALLOWED_STATUSES);
                    }
                    booking.setBookingStatus(status);
                }
                case "numberOfTicket" -> {
                    if (value instanceof Number) booking.setNumberOfTicket(((Number) value).intValue());
                }
            }
        });

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(updatedBooking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found with ID: " + id);
        }
        bookingRepository.deleteById(id);
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .idBooking(booking.getIdBooking())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUserId())
                .eventId(booking.getEventId())
                .ticketId(booking.getTicketId())
                .numberOfTicket(booking.getNumberOfTicket())
                .totalPrice(booking.getTotalPrice())
                .bookingStatus(booking.getBookingStatus())
                .bookingDate(booking.getBookingDate())
                .expiredAt(booking.getExpiredAt())
                .build();
    }
}
