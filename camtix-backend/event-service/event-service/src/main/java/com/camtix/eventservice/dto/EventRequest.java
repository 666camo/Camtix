package com.camtix.eventservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {

    @NotBlank(message = "Event name is required")
    private String eventName;

    private String artistName;

    @NotBlank(message = "City is required")
    private String city;

    private String location;

    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    private String eventTime;
    private String category;
    private String description;
    private String picture;
    private String status;
}
