package com.camtix.eventservice.service;

import com.camtix.eventservice.dto.TicketRequest;
import com.camtix.eventservice.dto.TicketResponse;
import com.camtix.eventservice.entity.Ticket;
import com.camtix.eventservice.repository.EventRepository;
import com.camtix.eventservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + id));
        return mapToTicketResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByEventId(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("Event not found with ID: " + eventId);
        }
        return ticketRepository.findByEventId(eventId).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse createTicket(TicketRequest request) {
        // Validate relational Event exists
        if (!eventRepository.existsById(request.getEventId())) {
            throw new IllegalArgumentException("Event not found with ID: " + request.getEventId());
        }

        Ticket ticket = Ticket.builder()
                .ticketType(request.getTicketType())
                .price(request.getPrice())
                .stock(request.getStock())
                .description(request.getDescription())
                .eventId(request.getEventId())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToTicketResponse(savedTicket);
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketRequest request) {
        // Validate Ticket exists
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + id));

        // Validate relational Event exists
        if (!eventRepository.existsById(request.getEventId())) {
            throw new IllegalArgumentException("Event not found with ID: " + request.getEventId());
        }

        ticket.setTicketType(request.getTicketType());
        ticket.setPrice(request.getPrice());
        ticket.setStock(request.getStock());
        ticket.setDescription(request.getDescription());
        ticket.setEventId(request.getEventId());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToTicketResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse reduceStock(Long id, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }

        int updatedRows = ticketRepository.reduceStockAtomic(id, quantity);
        if (updatedRows == 0) {
            Ticket ticket = ticketRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + id));
            throw new IllegalArgumentException("Insufficient stock for ticket ID: " + id + ". Available: " + ticket.getStock());
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + id));
        return mapToTicketResponse(ticket);
    }

    @Transactional
    public TicketResponse restoreStock(Long id, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }

        int updatedRows = ticketRepository.restoreStockAtomic(id, quantity);
        if (updatedRows == 0) {
            throw new IllegalArgumentException("Ticket not found with ID: " + id);
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + id));
        return mapToTicketResponse(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new IllegalArgumentException("Ticket not found with ID: " + id);
        }
        ticketRepository.deleteById(id);
    }

    private TicketResponse mapToTicketResponse(Ticket ticket) {
        return TicketResponse.builder()
                .idTicket(ticket.getIdTicket())
                .ticketType(ticket.getTicketType())
                .price(ticket.getPrice())
                .stock(ticket.getStock())
                .description(ticket.getDescription())
                .eventId(ticket.getEventId())
                .build();
    }
}
