package com.camtix.transactionservice.controller;

import com.camtix.transactionservice.dto.*;
import com.camtix.transactionservice.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<WebResponse<?>> getAllPayments(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long paymentMethodId,
            @RequestParam(required = false, defaultValue = "idPayment") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String direction
    ) {
        int pageSize = size != null ? size : (limit != null ? limit : 0);

        if (page != null || pageSize > 0) {
            int pageNumber = page != null ? Math.max(0, page) : 0;
            int effectiveSize = pageSize > 0 ? pageSize : 10;
            Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(pageNumber, effectiveSize, Sort.by(sortDirection, sortBy != null ? sortBy : "idPayment"));

            Page<PaymentResponse> paymentsPage = paymentService.getAllPaymentsPaged(status, paymentMethodId, pageable);
            WebResponse<Object> response = WebResponse.<Object>builder()
                    .status(true)
                    .message("Successfully retrieved payments with pagination.")
                    .data(paymentsPage)
                    .build();
            return ResponseEntity.ok(response);
        }

        List<PaymentResponse> payments = paymentService.getAllPayments();
        WebResponse<List<PaymentResponse>> response = WebResponse.<List<PaymentResponse>>builder()
                .status(true)
                .message("Successfully retrieved all payments.")
                .data(payments)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Successfully retrieved payment details.")
                .data(payment)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<WebResponse<PaymentResponse>> getPaymentByBookingId(@PathVariable Long bookingId) {
        PaymentResponse payment = paymentService.getPaymentByBookingId(bookingId);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Successfully retrieved payment linked to Booking ID: " + bookingId)
                .data(payment)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WebResponse<PaymentResponse>> createPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse payment = paymentService.createPayment(request);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Payment record created successfully.")
                .data(payment)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/upload-proof")
    public ResponseEntity<WebResponse<PaymentResponse>> uploadPaymentProof(
            @PathVariable Long id,
            @Valid @RequestBody UploadPaymentProofRequest request
    ) {
        PaymentResponse payment = paymentService.uploadPaymentProof(id, request);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Payment proof uploaded successfully.")
                .data(payment)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<WebResponse<PaymentResponse>> patchPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        PaymentResponse payment = paymentService.patchPayment(id, updates);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Payment partially updated.")
                .data(payment)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<WebResponse<PaymentResponse>> verifyPayment(
            @PathVariable Long id,
            @Valid @RequestBody VerifyPaymentRequest request
    ) {
        PaymentResponse payment = paymentService.verifyPayment(id, request);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Payment verified and booking confirmed successfully.")
                .data(payment)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<WebResponse<PaymentResponse>> rejectPayment(
            @PathVariable Long id,
            @Valid @RequestBody RejectPaymentRequest request
    ) {
        PaymentResponse payment = paymentService.rejectPayment(id, request);
        WebResponse<PaymentResponse> response = WebResponse.<PaymentResponse>builder()
                .status(true)
                .message("Payment rejected and booking cancelled successfully.")
                .data(payment)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/resend-ticket")
    public ResponseEntity<WebResponse<Void>> resendETicketEmail(@PathVariable Long bookingId) {
        paymentService.resendETicketEmail(bookingId);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("E-ticket email resent successfully.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/notify")
    public ResponseEntity<WebResponse<Void>> midtransWebhook(HttpServletRequest request) {
        try {
            java.io.BufferedReader reader = request.getReader();
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            String body = sb.toString();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> payload = mapper.readValue(body, java.util.Map.class);

            paymentService.midtransWebhook(body, payload);

            return ResponseEntity.ok(WebResponse.<Void>builder()
                    .status(true)
                    .message("Notification received.")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    WebResponse.<Void>builder().status(false).message(e.getMessage()).build()
            );
        }
    }
}
