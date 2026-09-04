package com.camtix.eventservice.controller;

import com.camtix.eventservice.dto.TicketRequest;
import com.camtix.eventservice.dto.TicketResponse;
import com.camtix.eventservice.dto.WebResponse;
import com.camtix.eventservice.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/api/tickets")
    public ResponseEntity<WebResponse<List<TicketResponse>>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        WebResponse<List<TicketResponse>> response = WebResponse.<List<TicketResponse>>builder()
                .status(true)
                .message("Successfully retrieved all tickets.")
                .data(tickets)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/tickets/{id}")
    public ResponseEntity<WebResponse<TicketResponse>> getTicketById(@PathVariable Long id) {
        TicketResponse ticket = ticketService.getTicketById(id);
        WebResponse<TicketResponse> response = WebResponse.<TicketResponse>builder()
                .status(true)
                .message("Successfully retrieved ticket details.")
                .data(ticket)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/events/{eventId}/tickets")
    public ResponseEntity<WebResponse<List<TicketResponse>>> getTicketsByEventId(@PathVariable Long eventId) {
        List<TicketResponse> tickets = ticketService.getTicketsByEventId(eventId);
        WebResponse<List<TicketResponse>> response = WebResponse.<List<TicketResponse>>builder()
                .status(true)
                .message("Successfully retrieved tickets for event ID: " + eventId)
                .data(tickets)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/tickets")
    public ResponseEntity<WebResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketRequest request) {
        TicketResponse ticket = ticketService.createTicket(request);
        WebResponse<TicketResponse> response = WebResponse.<TicketResponse>builder()
                .status(true)
                .message("Ticket successfully created.")
                .data(ticket)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/tickets/{id}")
    public ResponseEntity<WebResponse<TicketResponse>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request
    ) {
        TicketResponse ticket = ticketService.updateTicket(id, request);
        WebResponse<TicketResponse> response = WebResponse.<TicketResponse>builder()
                .status(true)
                .message("Ticket successfully updated.")
                .data(ticket)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/tickets/{id}")
    public ResponseEntity<WebResponse<Void>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("Ticket successfully deleted.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/tickets/{id}/reduce-stock")
    public ResponseEntity<WebResponse<TicketResponse>> reduceStock(
            @PathVariable Long id,
            @RequestParam @jakarta.validation.constraints.Min(value = 1, message = "Quantity must be at least 1") int quantity
    ) {
        TicketResponse ticket = ticketService.reduceStock(id, quantity);
        WebResponse<TicketResponse> response = WebResponse.<TicketResponse>builder()
                .status(true)
                .message("Ticket stock successfully reduced.")
                .data(ticket)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/tickets/{id}/restore-stock")
    public ResponseEntity<WebResponse<TicketResponse>> restoreStock(
            @PathVariable Long id,
            @RequestParam @jakarta.validation.constraints.Min(value = 1, message = "Quantity must be at least 1") int quantity
    ) {
        TicketResponse ticket = ticketService.restoreStock(id, quantity);
        WebResponse<TicketResponse> response = WebResponse.<TicketResponse>builder()
                .status(true)
                .message("Ticket stock successfully restored.")
                .data(ticket)
                .build();
        return ResponseEntity.ok(response);
    }
}
