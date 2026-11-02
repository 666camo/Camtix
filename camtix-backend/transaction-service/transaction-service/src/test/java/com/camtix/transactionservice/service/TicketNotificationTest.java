package com.camtix.transactionservice.service;

import com.camtix.transactionservice.dto.VerifyPaymentRequest;
import com.camtix.transactionservice.entity.Booking;
import com.camtix.transactionservice.entity.Payment;
import com.camtix.transactionservice.repository.BookingRepository;
import com.camtix.transactionservice.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketNotificationTest {
    @Mock PaymentRepository paymentRepository;
    @Mock BookingRepository bookingRepository;
    @Mock RestTemplate restTemplate;
    @Mock EmailService emailService;
    @InjectMocks PaymentService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "eventServiceUrl", "http://events");
        ReflectionTestUtils.setField(service, "userServiceUrl", "http://users");
    }

    private Booking booking() {
        return Booking.builder().idBooking(1L).userId(2L).eventId(3L).ticketId(4L)
                .bookingCode("CTX-123").numberOfTicket(2).totalPrice(new BigDecimal("300000"))
                .bookingStatus("CONFIRMED").build();
    }

    @Test
    void assemblesFullTicketAndSendsOnlyOneNotification() {
        when(restTemplate.exchange(eq("http://users/api/users/2"), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("data", Map.of("email", "preview@example.com", "firstName", "Nadia", "lastName", "Putri"))));
        when(restTemplate.getForObject("http://events/api/events/3", Map.class))
                .thenReturn(Map.of("data", Map.of("eventName", "Live Session", "eventDate", "2027-05-20", "eventTime", "19:00", "location", "Music Hall", "city", "Jakarta")));
        when(restTemplate.getForObject("http://events/api/tickets/4", Map.class))
                .thenReturn(Map.of("data", Map.of("ticketType", "Regular")));
        service.sendETicketNotification(booking());
        var ticket = ArgumentCaptor.forClass(EmailService.TicketEmail.class);
        verify(emailService, times(1)).sendETicketEmail(eq("preview@example.com"), ticket.capture());
        verifyNoMoreInteractions(emailService);
        assertEquals("Nadia Putri", ticket.getValue().customerName());
        assertEquals("Music Hall", ticket.getValue().venue());
        assertEquals("19:00", ticket.getValue().eventTime());
        assertEquals(new BigDecimal("300000"), ticket.getValue().totalPrice());
    }

    @Test
    void repeatedManualVerificationDoesNotResendTicket() {
        PaymentService spy = spy(service);
        Booking booking = booking();
        Payment payment = Payment.builder().idPayment(1L).bookingId(1L).paymentStatus("PENDING").build();
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        doNothing().when(spy).sendETicketNotification(booking);
        spy.verifyPayment(1L, new VerifyPaymentRequest());
        spy.verifyPayment(1L, new VerifyPaymentRequest());
        verify(spy, times(1)).sendETicketNotification(booking);
        assertEquals("PAID", payment.getPaymentStatus());
    }

    @Test
    void explicitResendStillSendsWhenRequested() {
        PaymentService spy = spy(service);
        Booking booking = booking();
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        doNothing().when(spy).sendETicketNotification(booking);
        spy.resendETicketEmail(1L);
        spy.resendETicketEmail(1L);
        verify(spy, times(2)).sendETicketNotification(booking);
    }

    @Test
    void repeatedSettlementDoesNotResendTicket() {
        PaymentService spy = spy(service);
        Booking booking = booking();
        Payment payment = Payment.builder().idPayment(1L).bookingId(1L).paymentStatus("PENDING").build();
        when(paymentRepository.findByMidtransOrderId("CTX-1")).thenReturn(Optional.of(payment));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        doNothing().when(spy).sendETicketNotification(booking);
        Map<String, Object> payload = Map.of("order_id", "CTX-1", "transaction_status", "settlement", "fraud_status", "accept");
        spy.midtransWebhook("", payload);
        spy.midtransWebhook("", payload);
        verify(spy, times(1)).sendETicketNotification(booking);
    }
}
