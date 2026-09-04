package com.camtix.transactionservice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long idBooking;
    private String bookingCode;
    private Long userId;
    private Long eventId;
    private Long ticketId;
    private Integer numberOfTicket;
    private BigDecimal totalPrice;
    private String bookingStatus;
    private LocalDateTime bookingDate;
    private LocalDateTime expiredAt;
}
