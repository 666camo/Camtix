package com.camtix.eventservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {

    @NotBlank(message = "Ticket type is required")
    private String ticketType;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be less than 0")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be less than 0")
    private Integer stock;

    private String description;

    @NotNull(message = "Event ID is required")
    private Long eventId;
}
