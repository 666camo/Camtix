package com.camtix.userservice.controller;

import com.camtix.userservice.dto.UpdateUserRequest;
import com.camtix.userservice.dto.WebResponse;
import com.camtix.userservice.entity.User;
import com.camtix.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<WebResponse<?>> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false, defaultValue = "idUser") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction
    ) {
        int pageSize = size != null ? size : (limit != null ? limit : 0);

        if (page != null || pageSize > 0) {
            int pageNumber = page != null ? Math.max(0, page) : 0;
            int effectiveSize = pageSize > 0 ? pageSize : 10;
            Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(pageNumber, effectiveSize, Sort.by(sortDirection, sortBy != null ? sortBy : "idUser"));
            
            Page<User> usersPage = userService.getAllUsersPaged(search, role, pageable);
            WebResponse<Object> response = WebResponse.<Object>builder()
                    .status(true)
                    .message("Successfully retrieved all users with pagination.")
                    .data(usersPage)
                    .build();
            return ResponseEntity.ok(response);
        }

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

    @PutMapping("/{id}")
    public ResponseEntity<WebResponse<User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        User user = userService.updateUser(id, request);
        WebResponse<User> response = WebResponse.<User>builder()
                .status(true)
                .message("User profile successfully updated.")
                .data(user)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<WebResponse<User>> patchUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        User user = userService.patchUser(id, updates);
        WebResponse<User> response = WebResponse.<User>builder()
                .status(true)
                .message("User profile partially updated.")
                .data(user)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("User successfully deleted.")
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<WebResponse<Void>> banUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
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
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.unbanUser(id, userDetails.getUsername());
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("User account has been successfully unbanned.")
                .build();
        return ResponseEntity.ok(response);
    }
}
