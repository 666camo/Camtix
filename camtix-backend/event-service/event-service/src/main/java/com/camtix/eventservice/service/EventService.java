package com.camtix.eventservice.service;

import com.camtix.eventservice.dto.EventRequest;
import com.camtix.eventservice.dto.EventResponse;
import com.camtix.eventservice.entity.Event;
import com.camtix.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    private static final List<String> ALLOWED_STATUSES = Arrays.asList("UPCOMING", "ONGOING", "FINISHED", "CANCELLED");

    @Transactional(readOnly = true)
    @Cacheable("events")
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "event", key = "#id")
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));
        return mapToEventResponse(event);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "event", key = "#slug")
    public EventResponse getEventBySlug(String slug) {
        Event event = eventRepository.findBySlug(slug)
                .or(() -> {
                    if (slug != null && slug.matches("\\d+")) {
                        return eventRepository.findById(Long.parseLong(slug));
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new IllegalArgumentException("Event not found with slug or ID: " + slug));
        return mapToEventResponse(event);
    }

    private String generateSlug(String text) {
        if (text == null) return "";
        return text.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    @Transactional
    @CacheEvict(value = "events", allEntries = true)
    public EventResponse createEvent(EventRequest request) {
        String status = request.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = "UPCOMING";
        } else {
            status = status.toUpperCase();
            if (!ALLOWED_STATUSES.contains(status)) {
                throw new IllegalArgumentException("Invalid event status. Allowed: " + ALLOWED_STATUSES);
            }
        }

        Event event = Event.builder()
                .eventName(request.getEventName())
                .artistName(request.getArtistName())
                .city(request.getCity())
                .location(request.getLocation())
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .category(request.getCategory())
                .description(request.getDescription())
                .picture(request.getPicture())
                .status(status)
                .slug(generateSlug(request.getEventName()))
                .build();

        Event savedEvent = eventRepository.save(event);
        return mapToEventResponse(savedEvent);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "events", allEntries = true),
        @CacheEvict(value = "event", key = "#id")
    })
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));

        String status = request.getStatus();
        if (status != null && !status.trim().isEmpty()) {
            status = status.toUpperCase();
            if (!ALLOWED_STATUSES.contains(status)) {
                throw new IllegalArgumentException("Invalid event status. Allowed: " + ALLOWED_STATUSES);
            }
            event.setStatus(status);
        }

        event.setEventName(request.getEventName());
        event.setArtistName(request.getArtistName());
        event.setCity(request.getCity());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setEventTime(request.getEventTime());
        event.setCategory(request.getCategory());
        event.setDescription(request.getDescription());
        event.setPicture(request.getPicture());
        event.setSlug(generateSlug(request.getEventName()));

        Event updatedEvent = eventRepository.save(event);
        return mapToEventResponse(updatedEvent);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "events", allEntries = true),
        @CacheEvict(value = "event", key = "#id")
    })
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with ID: " + id);
        }
        eventRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> searchEvents(String eventName, String artistName, String city, String category) {
        // Normalize empty inputs to null for JPQL compatibility
        String normalizedEventName = (eventName == null || eventName.trim().isEmpty()) ? null : eventName.trim();
        String normalizedArtistName = (artistName == null || artistName.trim().isEmpty()) ? null : artistName.trim();
        String normalizedCity = (city == null || city.trim().isEmpty()) ? null : city.trim();
        String normalizedCategory = (category == null || category.trim().isEmpty()) ? null : category.trim();

        return eventRepository.searchEvents(normalizedEventName, normalizedArtistName, normalizedCity, normalizedCategory)
                .stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    private EventResponse mapToEventResponse(Event event) {
        return EventResponse.builder()
                .idEvent(event.getIdEvent())
                .eventName(event.getEventName())
                .artistName(event.getArtistName())
                .city(event.getCity())
                .location(event.getLocation())
                .eventDate(event.getEventDate())
                .eventTime(event.getEventTime())
                .category(event.getCategory())
                .description(event.getDescription())
                .picture(event.getPicture())
                .status(event.getStatus())
                .slug(event.getSlug())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
