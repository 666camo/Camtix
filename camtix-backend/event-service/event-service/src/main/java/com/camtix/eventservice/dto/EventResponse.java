package com.camtix.eventservice.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long idEvent;
    private String eventName;
    private String artistName;
    private String city;
    private String location;
    private LocalDate eventDate;
    private String eventTime;
    private String category;
    private String description;
    private String picture;
    private String status;
    private String slug;
    private LocalDateTime createdAt;
}
