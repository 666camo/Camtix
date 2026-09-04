package com.camtix.eventservice.controller;

import com.camtix.eventservice.dto.EventRequest;
import com.camtix.eventservice.dto.EventResponse;
import com.camtix.eventservice.dto.WebResponse;
import com.camtix.eventservice.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final com.camtix.eventservice.service.FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<WebResponse<List<EventResponse>>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents();
        WebResponse<List<EventResponse>> response = WebResponse.<List<EventResponse>>builder()
                .status(true)
                .message("Successfully retrieved all events.")
                .data(events)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<WebResponse<List<EventResponse>>> searchEvents(
            @RequestParam(value = "eventName", required = false) String eventName,
            @RequestParam(value = "artistName", required = false) String artistName,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "category", required = false) String category
    ) {
        List<EventResponse> events = eventService.searchEvents(eventName, artistName, city, category);
        WebResponse<List<EventResponse>> response = WebResponse.<List<EventResponse>>builder()
                .status(true)
                .message("Search completed successfully.")
                .data(events)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<WebResponse<EventResponse>> getEventBySlug(@PathVariable String slug) {
        EventResponse event = eventService.getEventBySlug(slug);
        WebResponse<EventResponse> response = WebResponse.<EventResponse>builder()
                .status(true)
                .message("Successfully retrieved event details by slug.")
                .data(event)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<EventResponse>> getEventById(@PathVariable Long id) {
        EventResponse event = eventService.getEventById(id);
        WebResponse<EventResponse> response = WebResponse.<EventResponse>builder()
                .status(true)
                .message("Successfully retrieved event details.")
                .data(event)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WebResponse<EventResponse>> createEvent(@Valid @RequestBody EventRequest request) {
        EventResponse event = eventService.createEvent(request);
        WebResponse<EventResponse> response = WebResponse.<EventResponse>builder()
                .status(true)
                .message("Event successfully created.")
                .data(event)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request
    ) {
        EventResponse event = eventService.updateEvent(id, request);
        WebResponse<EventResponse> response = WebResponse.<EventResponse>builder()
                .status(true)
                .message("Event successfully updated.")
                .data(event)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("Event successfully deleted.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<WebResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        Map<String, String> result = new HashMap<>();
        result.put("url", fileStorageService.uploadImage(file));
        WebResponse<Map<String, String>> response = WebResponse.<Map<String, String>>builder()
                .status(true)
                .message("Image uploaded successfully.")
                .data(result)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
