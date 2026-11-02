package com.camtix.transactionservice.service;

import com.camtix.transactionservice.dto.*;
import com.camtix.transactionservice.entity.Booking;
import com.camtix.transactionservice.entity.Payment;
import com.camtix.transactionservice.exception.ResourceNotFoundException;
import com.camtix.transactionservice.repository.BookingRepository;
import com.camtix.transactionservice.repository.PaymentMethodRepository;
import com.camtix.transactionservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final RestTemplate restTemplate;
    private final EmailService emailService;
    private final MidtransService midtransService;

    @org.springframework.beans.factory.annotation.Value("${event.service.url}")
    private String eventServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${user.service.url}")
    private String userServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${midtrans.server-key:}")
    private String midtransServerKey;

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPaymentsPaged(String status, Long paymentMethodId, Pageable pageable) {
        String st = (status == null || status.trim().isEmpty()) ? null : status.trim().toUpperCase();
        return paymentRepository.findWithFilters(st, paymentMethodId, pageable)
                .map(this::mapToPaymentResponse);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return mapToPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for Booking ID: " + bookingId));
        return mapToPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (!paymentMethodRepository.existsById(request.getPaymentMethodId())) {
            throw new ResourceNotFoundException("Payment method not found with ID: " + request.getPaymentMethodId());
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethodId(request.getPaymentMethodId())
                .totalPayment(request.getTotalPayment())
                .paymentStatus("PENDING")
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        if (Boolean.TRUE.equals(request.getUseMidtrans())) {
            MidtransService.MidtransSnapData snap = midtransService.createSnapTransaction(
                    booking.getIdBooking(),
                    request.getTotalPayment(),
                    "noreply@camtix.com",
                    "CamTix Customer"
            );
            if (snap != null) {
                savedPayment.setSnapToken(snap.token);
                savedPayment.setMidtransOrderId(snap.orderId);
                savedPayment = paymentRepository.save(savedPayment);
            }
        }

        return mapToPaymentResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse uploadPaymentProof(Long id, UploadPaymentProofRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        payment.setPaymentProof(request.getPaymentProof());
        payment.setPaymentStatus("WAITING_CONFIRMATION");
        payment.setPaymentDate(LocalDateTime.now());

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(updatedPayment);
    }

    @Transactional
    public PaymentResponse patchPayment(Long id, Map<String, Object> updates) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        updates.forEach((key, value) -> {
            switch (key) {
                case "paymentStatus" -> payment.setPaymentStatus(((String) value).toUpperCase());
                case "adminNote" -> payment.setAdminNote((String) value);
                case "totalPayment" -> {
                    if (value instanceof Number) payment.setTotalPayment(BigDecimal.valueOf(((Number) value).doubleValue()));
                }
            }
        });

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(updatedPayment);
    }

    @Transactional
    public PaymentResponse verifyPayment(Long id, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        boolean alreadyPaid = "PAID".equalsIgnoreCase(payment.getPaymentStatus());
        payment.setPaymentStatus("PAID");
        payment.setVerifiedAt(LocalDateTime.now());
        if (request.getAdminNote() != null && !request.getAdminNote().trim().isEmpty()) {
            payment.setAdminNote(request.getAdminNote().trim());
        }

        Long bookingId = payment.getBookingId();
        if (bookingId == null && payment.getBooking() != null) {
            bookingId = payment.getBooking().getIdBooking();
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Associated booking not found with ID: " + payment.getBookingId()));
        booking.setBookingStatus("CONFIRMED");
        bookingRepository.save(booking);

        if (!alreadyPaid) sendETicketNotification(booking);

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(updatedPayment);
    }

    @Transactional(readOnly = true)
    public void resendETicketEmail(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Associated booking not found with ID: " + bookingId));
        if (!"CONFIRMED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new IllegalArgumentException("Cannot send e-ticket for unconfirmed booking.");
        }
        sendETicketNotification(booking);
    }

    public void sendETicketNotification(Booking booking) {
        String userEmail = "";
        String customerName = "Teman CamTix";
        try {
            String userUrl = userServiceUrl + "/api/users/" + booking.getUserId();

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            org.springframework.web.context.request.ServletRequestAttributes attributes =
                (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                jakarta.servlet.http.HttpServletRequest requestContext = attributes.getRequest();
                String authHeader = requestContext.getHeader("Authorization");
                if (authHeader != null) {
                    headers.set("Authorization", authHeader);
                }
            }

            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<java.util.Map> responseEntity = restTemplate.exchange(
                userUrl,
                org.springframework.http.HttpMethod.GET,
                entity,
                java.util.Map.class
            );

            java.util.Map<?, ?> userRes = responseEntity.getBody();
            if (userRes != null && userRes.get("data") != null) {
                java.util.Map<?, ?> userData = (java.util.Map<?, ?>) userRes.get("data");
                userEmail = (String) userData.get("email");
                Object fullName = userData.get("fullName");
                if (fullName != null && !fullName.toString().isBlank()) {
                    customerName = fullName.toString();
                } else {
                    String firstName = java.util.Objects.toString(userData.get("firstName"), "");
                    String lastName = java.util.Objects.toString(userData.get("lastName"), "");
                    String name = (firstName + " " + lastName).strip();
                    if (!name.isBlank()) customerName = name;
                }
            }
        } catch (Exception e) {
            log.error("Failed to call user-service for user ID {}: {}", booking.getUserId(), e.getMessage());
        }

        String eventName = "Konser Musik";
        String eventDate = null;
        String eventTime = null;
        String venue = null;
        String city = null;
        try {
            String eventUrl = eventServiceUrl + "/api/events/" + booking.getEventId();
            java.util.Map<?, ?> eventRes = restTemplate.getForObject(eventUrl, java.util.Map.class);
            if (eventRes != null && eventRes.get("data") != null) {
                java.util.Map<?, ?> eventData = (java.util.Map<?, ?>) eventRes.get("data");
                eventName = (String) eventData.get("eventName");
                eventDate = (String) eventData.get("eventDate");
                eventTime = (String) eventData.get("eventTime");
                venue = (String) eventData.get("location");
                city = (String) eventData.get("city");
            }
        } catch (Exception e) {
            log.error("Failed to call event-service for event ID {}: {}", booking.getEventId(), e.getMessage());
        }

        String ticketType = null;
        try {
            String ticketUrl = eventServiceUrl + "/api/tickets/" + booking.getTicketId();
            java.util.Map<?, ?> ticketRes = restTemplate.getForObject(ticketUrl, java.util.Map.class);
            if (ticketRes != null && ticketRes.get("data") != null) {
                java.util.Map<?, ?> ticketData = (java.util.Map<?, ?>) ticketRes.get("data");
                ticketType = (String) ticketData.get("ticketType");
            }
        } catch (Exception e) {
            log.error("Failed to call ticket details for ticket ID {}: {}", booking.getTicketId(), e.getMessage());
        }

        if (userEmail != null && !userEmail.isEmpty()) {
            emailService.sendETicketEmail(userEmail, new EmailService.TicketEmail(
                    customerName, booking.getBookingCode(), eventName, eventDate, eventTime,
                    venue, city, ticketType, booking.getNumberOfTicket(), booking.getTotalPrice()));
        }
    }

    @Transactional
    public PaymentResponse rejectPayment(Long id, RejectPaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));

        payment.setPaymentStatus("REJECTED");
        payment.setAdminNote(request.getAdminNote().trim());

        Long bookingId = payment.getBookingId();
        if (bookingId == null && payment.getBooking() != null) {
            bookingId = payment.getBooking().getIdBooking();
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Associated booking not found with ID: " + payment.getBookingId()));
        booking.setBookingStatus("CANCELLED");
        bookingRepository.save(booking);

        try {
            String url = eventServiceUrl + "/api/tickets/" + booking.getTicketId() + "/restore-stock?quantity=" + booking.getNumberOfTicket();
            restTemplate.put(url, null);
        } catch (Exception e) {
            throw new IllegalArgumentException("Gagal mengembalikan stok tiket di Event Service: " + e.getMessage());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(updatedPayment);
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        Long bId = payment.getBookingId();
        if (bId == null && payment.getBooking() != null) {
            bId = payment.getBooking().getIdBooking();
        }
        return PaymentResponse.builder()
                .idPayment(payment.getIdPayment())
                .bookingId(bId)
                .paymentMethodId(payment.getPaymentMethodId())
                .totalPayment(payment.getTotalPayment())
                .paymentStatus(payment.getPaymentStatus())
                .paymentProof(payment.getPaymentProof())
                .paymentDate(payment.getPaymentDate())
                .verifiedAt(payment.getVerifiedAt())
                .adminNote(payment.getAdminNote())
                .snapToken(payment.getSnapToken())
                .midtransOrderId(payment.getMidtransOrderId())
                .build();
    }

    @Transactional
    public PaymentResponse midtransWebhook(String rawBody, Map<String, Object> payload) {
        String orderId = (String) payload.get("order_id");
        String transactionStatus = (String) payload.get("transaction_status");
        String fraudStatus = (String) payload.get("fraud_status");
        String statusMessage = (String) payload.get("status_message");
        String statusCode = (String) payload.get("status_code");
        String grossAmount = String.valueOf(payload.get("gross_amount"));
        String signatureKey = (String) payload.get("signature_key");

        log.info("Midtrans notification: orderId={} status={} fraud={} amount={}", orderId, transactionStatus, fraudStatus, grossAmount);

        if (midtransServerKey != null && !midtransServerKey.trim().isEmpty() && signatureKey != null) {
            String rawSignature = orderId + statusCode + grossAmount + midtransServerKey;
            String computedSignature = sha512Hex(rawSignature);
            if (!computedSignature.equalsIgnoreCase(signatureKey)) {
                log.error("Midtrans signature mismatch for orderId={}. Potential forged webhook.", orderId);
                throw new IllegalArgumentException("Invalid Midtrans signature");
            }
        }

        Payment payment = paymentRepository.findByMidtransOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order_id: " + orderId));

        if ("capture".equals(transactionStatus) || "settlement".equals(transactionStatus)) {
            if ("accept".equals(fraudStatus) || "capture".equals(fraudStatus) || fraudStatus == null) {
                boolean alreadyPaid = "PAID".equalsIgnoreCase(payment.getPaymentStatus());
                payment.setPaymentStatus("PAID");
                payment.setVerifiedAt(java.time.LocalDateTime.now());

                Long bId = payment.getBookingId();
                if (bId == null && payment.getBooking() != null) {
                    bId = payment.getBooking().getIdBooking();
                }

                Booking booking = bookingRepository.findById(bId).orElse(null);
                if (booking != null) {
                    booking.setBookingStatus("CONFIRMED");
                    bookingRepository.save(booking);

                    try {
                        if (!alreadyPaid) sendETicketNotification(booking);
                    } catch (Exception ex) {
                        log.error("Failed to send e-ticket after midtrans settlement: {}", ex.getMessage());
                    }
                }
            } else {
                payment.setPaymentStatus("REJECTED");
                payment.setAdminNote("Fraud detected by Midtrans: " + statusMessage);
            }
        } else if ("cancel".equals(transactionStatus) || "expire".equals(transactionStatus) || "deny".equals(transactionStatus)) {
            payment.setPaymentStatus(transactionStatus.toUpperCase());

            Long bId = payment.getBookingId();
            if (bId == null && payment.getBooking() != null) {
                bId = payment.getBooking().getIdBooking();
            }

            Booking booking = bookingRepository.findById(bId).orElse(null);
            if (booking != null) {
                booking.setBookingStatus("CANCELLED");
                bookingRepository.save(booking);
            }
        }

        return mapToPaymentResponse(paymentRepository.save(payment));
    }

    private String sha512Hex(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-512");
            byte[] digest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-512 algorithm not available", e);
        }
    }
}
