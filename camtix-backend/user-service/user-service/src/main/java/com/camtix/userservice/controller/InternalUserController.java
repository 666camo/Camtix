package com.camtix.userservice.controller;

import com.camtix.userservice.dto.WebResponse;
import com.camtix.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserController {
    private final UserService userService;

    @Value("${internal.api.key:}")
    private String internalApiKey;

    public record TicketRecipient(String email, String firstName, String lastName) {}

    @GetMapping("/{id}/ticket-recipient")
    public ResponseEntity<WebResponse<TicketRecipient>> getTicketRecipient(
            @PathVariable Long id,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String suppliedKey) {
        // Authenticate before looking up the user, without granting an admin role.
        if (internalApiKey == null || internalApiKey.isBlank() || suppliedKey == null
                || !MessageDigest.isEqual(internalApiKey.getBytes(StandardCharsets.UTF_8),
                                        suppliedKey.getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(WebResponse.<TicketRecipient>builder()
                    .status(false).message("Invalid internal credentials").build());
        }
        var user = userService.getUserById(id);
        var recipient = new TicketRecipient(user.getEmail(), user.getFirstName(), user.getLastName());
        return ResponseEntity.ok(WebResponse.<TicketRecipient>builder()
                .status(true).message("Ticket recipient retrieved.").data(recipient).build());
    }
}
