package com.camtix.eventservice.controller;

import com.camtix.eventservice.dto.TicketRequest;
import com.camtix.eventservice.dto.TicketResponse;
import com.camtix.eventservice.dto.WebResponse;
import com.camtix.eventservice.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/api/tickets")
    public ResponseEntity<WebResponse<?>> getAllTickets(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false, defaultValue = "idTicket") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction
    ) {
        int pageSize = size != null ? size : (limit != null ? limit : 0);

        if (page != null || pageSize > 0) {
            int pageNumber = page != null ? Math.max(0, page) : 0;
            int effectiveSize = pageSize > 0 ? pageSize : 10;
            Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(pageNumber, effectiveSize, Sort.by(sortDirection, sortBy != null ? sortBy : "idTicket"));

            Page<TicketResponse> ticketsPage = ticketService.getAllTicketsPaged(search, eventId, pageable);
            WebResponse<Object> response = WebResponse.<Object>builder()
                    .status(true)
                    .message("Successfully retrieved tickets with pagination.")
                    .data(ticketsPage)
                    .build();
            return ResponseEntity.ok(response);
        }

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

    @PatchMapping("/api/tickets/{id}")
    public ResponseEntity<WebResponse<TicketResponse>> patchTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        TicketResponse ticket = ticketService.patchTicket(id, updates);
        WebResponse<TicketResponse> response = WebResponse.<TicketResponse>builder()
                .status(true)
                .message("Ticket partially updated.")
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
