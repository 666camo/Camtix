package com.camtix.transactionservice.controller;

import com.camtix.transactionservice.dto.BookingRequest;
import com.camtix.transactionservice.dto.BookingResponse;
import com.camtix.transactionservice.dto.WebResponse;
import com.camtix.transactionservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<WebResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status(true)
                .message("Successfully retrieved all bookings.")
                .data(bookings)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status(true)
                .message("Successfully retrieved booking details.")
                .data(booking)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<WebResponse<List<BookingResponse>>> getBookingsByUserId(@PathVariable Long userId) {
        List<BookingResponse> bookings = bookingService.getBookingsByUserId(userId);
        WebResponse<List<BookingResponse>> response = WebResponse.<List<BookingResponse>>builder()
                .status(true)
                .message("Successfully retrieved bookings for user ID: " + userId)
                .data(bookings)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WebResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse booking = bookingService.createBooking(request);
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status(true)
                .message("Booking successfully created.")
                .data(booking)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<WebResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        BookingResponse booking = bookingService.updateBookingStatus(id, status);
        WebResponse<BookingResponse> response = WebResponse.<BookingResponse>builder()
                .status(true)
                .message("Booking status successfully updated.")
                .data(booking)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebResponse<Void>> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("Booking successfully deleted.")
                .build();
        return ResponseEntity.ok(response);
    }
}
