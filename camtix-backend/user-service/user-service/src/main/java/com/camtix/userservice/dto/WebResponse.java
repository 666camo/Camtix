package com.camtix.userservice.dto;

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
