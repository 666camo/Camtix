package com.camtix.transactionservice.service;

import com.camtix.transactionservice.dto.BookingRequest;
import com.camtix.transactionservice.dto.BookingResponse;
import com.camtix.transactionservice.entity.Booking;
import com.camtix.transactionservice.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "eventServiceUrl", "http://localhost:8082");
    }

    @Test
    void testCreateBooking_Success() {
        BookingRequest request = new BookingRequest();
        request.setUserId(1L);
        request.setEventId(10L);
        request.setTicketId(100L);
        request.setNumberOfTicket(2);
        request.setTotalPrice(BigDecimal.valueOf(500000));

        Booking saved = Booking.builder()
                .idBooking(1L)
                .bookingCode("CTX-20260825-ABCD1234")
                .userId(1L)
                .eventId(10L)
                .ticketId(100L)
                .numberOfTicket(2)
                .totalPrice(BigDecimal.valueOf(500000))
                .bookingStatus("PENDING")
                .bookingDate(LocalDateTime.now())
                .expiredAt(LocalDateTime.now().plusMinutes(30))
                .build();

        doNothing().when(restTemplate).put(anyString(), isNull());
        when(bookingRepository.save(any(Booking.class))).thenReturn(saved);

        BookingResponse response = bookingService.createBooking(request);

        assertNotNull(response);
        assertEquals("PENDING", response.getBookingStatus());
        assertTrue(response.getBookingCode().startsWith("CTX-"));
        verify(restTemplate, times(1)).put(contains("/api/tickets/100/reduce-stock"), isNull());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testGetBookingById_NotFound() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> bookingService.getBookingById(999L));
    }
}
