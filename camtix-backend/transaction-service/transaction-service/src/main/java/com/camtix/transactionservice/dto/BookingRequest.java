package com.camtix.transactionservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotNull(message = "Number of tickets is required")
    @Min(value = 1, message = "Number of tickets must be at least 1")
    private Integer numberOfTicket;

    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", message = "Total price cannot be negative")
    private BigDecimal totalPrice;
}
