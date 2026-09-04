package com.camtix.eventservice.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long idTicket;
    private String ticketType;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private Long eventId;
}
