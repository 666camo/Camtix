package com.camtix.eventservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebResponse<T> {
    private boolean status;
    private String message;
    private T data;
}
