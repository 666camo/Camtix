package com.camtix.userservice.controller;

import com.camtix.userservice.dto.WebResponse;
import com.camtix.userservice.entity.User;
import com.camtix.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<WebResponse<?>> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "idUser") String sortBy
    ) {
        // Support optional pagination request parameter.
        // If page AND size provided, return a Paged metadata + content payload.
        // Else return simple full List array (keeps 100% compatibility with existing React Admin Dashboard).
        if (page != null && size != null) {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    page, size, org.springframework.data.domain.Sort.by(sortBy != null ? sortBy : "idUser")
            );
            org.springframework.data.domain.Page<User> usersPage = userService.getAllUsersPaged(pageable);
            WebResponse<Object> response = WebResponse.<Object>builder()
                    .status(true)
                    .message("Successfully retrieved all users with pagination.")
                    .data(usersPage)
                    .build();
            return ResponseEntity.ok(response);
        }

        // Default standard list fetch
        List<User> users = userService.getAllUsers();
        WebResponse<List<User>> response = WebResponse.<List<User>>builder()
                .status(true)
                .message("Successfully retrieved all users.")
                .data(users)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<User>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        WebResponse<User> response = WebResponse.<User>builder()
                .status(true)
                .message("Successfully retrieved user details.")
                .data(user)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<WebResponse<Void>> banUser(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        userService.banUser(id, userDetails.getUsername());
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("User account has been successfully banned.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/unban")
    public ResponseEntity<WebResponse<Void>> unbanUser(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        userService.unbanUser(id, userDetails.getUsername());
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("User account has been successfully unbanned.")
                .build();
        return ResponseEntity.ok(response);
    }
}
