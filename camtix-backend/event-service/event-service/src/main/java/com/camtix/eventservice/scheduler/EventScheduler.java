package com.camtix.eventservice.scheduler;

import com.camtix.eventservice.entity.Event;
import com.camtix.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventScheduler {

    private final EventRepository eventRepository;

    @Scheduled(fixedRate = 60000) // Run every 1 minute
    @Transactional
    public void finalizePastEvents() {
        LocalDate today = LocalDate.now();
        // Fetch all events that occurred before today and are not yet FINISHED or CANCELLED
        List<Event> pastEvents = eventRepository.findByEventDateBeforeAndStatusNotIn(
                today,
                Arrays.asList("FINISHED", "CANCELLED")
        );

        if (!pastEvents.isEmpty()) {
            for (Event event : pastEvents) {
                event.setStatus("FINISHED");
            }
            eventRepository.saveAll(pastEvents);
            log.info("Scheduler: Marked {} past events as FINISHED.", pastEvents.size());
        }
    }
}
