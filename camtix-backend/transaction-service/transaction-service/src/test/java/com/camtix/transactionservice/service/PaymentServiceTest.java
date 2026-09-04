package com.camtix.transactionservice.service;

import com.camtix.transactionservice.dto.PaymentResponse;
import com.camtix.transactionservice.entity.Booking;
import com.camtix.transactionservice.entity.Payment;
import com.camtix.transactionservice.repository.BookingRepository;
import com.camtix.transactionservice.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PaymentService paymentService;

    private static final String SERVER_KEY = "dummy-server-key";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "midtransServerKey", SERVER_KEY);
    }

    private String generateSignature(String orderId, String statusCode, String grossAmount, String serverKey) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-512");
        byte[] digest = md.digest((orderId + statusCode + grossAmount + serverKey).getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @Test
    void testMidtransWebhook_Settlement_Success() throws Exception {
        String orderId = "CAMTIX-1-12345678";
        String statusCode = "200";
        String grossAmount = "150000";
        String signature = generateSignature(orderId, statusCode, grossAmount, SERVER_KEY);

        Map<String, Object> payload = new HashMap<>();
        payload.put("order_id", orderId);
        payload.put("status_code", statusCode);
        payload.put("gross_amount", grossAmount);
        payload.put("transaction_status", "settlement");
        payload.put("fraud_status", "accept");
        payload.put("signature_key", signature);

        Payment payment = Payment.builder()
                .idPayment(1L)
                .bookingId(1L)
                .midtransOrderId(orderId)
                .paymentStatus("PENDING")
                .totalPayment(BigDecimal.valueOf(150000))
                .build();

        Booking booking = Booking.builder()
                .idBooking(1L)
                .bookingStatus("PENDING")
                .build();

        when(paymentRepository.findByMidtransOrderId(orderId)).thenReturn(Optional.of(payment));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse response = paymentService.midtransWebhook("rawBody", payload);

        assertNotNull(response);
        assertEquals("PAID", response.getPaymentStatus());
        assertEquals("CONFIRMED", booking.getBookingStatus());
        verify(paymentRepository, times(1)).save(payment);
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    void testMidtransWebhook_InvalidSignature_ThrowsException() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("order_id", "CAMTIX-1-FAKE");
        payload.put("status_code", "200");
        payload.put("gross_amount", "100000");
        payload.put("transaction_status", "settlement");
        payload.put("signature_key", "invalid-signature-hash");

        assertThrows(IllegalArgumentException.class, () -> paymentService.midtransWebhook("rawBody", payload));
    }
}
