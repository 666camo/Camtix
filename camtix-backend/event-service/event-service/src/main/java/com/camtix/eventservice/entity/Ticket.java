package com.camtix.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Long idTicket;

    @Column(name = "ticket_type")
    private String ticketType;

    private BigDecimal price;
    private Integer stock;
    private String description;

    @Column(name = "event_id")
    private Long eventId;
}
