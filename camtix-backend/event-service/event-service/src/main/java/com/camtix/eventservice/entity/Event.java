package com.camtix.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_event")
    private Long idEvent;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "artist_name")
    private String artistName;

    private String city;
    private String location;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "event_time")
    private String eventTime;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String picture;

    private String status;

    @Column(unique = true)
    private String slug;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
