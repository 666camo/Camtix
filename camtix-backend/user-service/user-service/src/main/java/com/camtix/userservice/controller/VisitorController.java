package com.camtix.userservice.controller;

import com.camtix.userservice.dto.WebResponse;
import com.camtix.userservice.entity.Visitor;
import com.camtix.userservice.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;
    private final com.camtix.userservice.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<WebResponse<List<Visitor>>> getAllVisitors() {
        List<Visitor> visitors = visitorService.getAllVisitors();
        WebResponse<List<Visitor>> response = WebResponse.<List<Visitor>>builder()
                .status(true)
                .message("Successfully retrieved all visitors.")
                .data(visitors)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WebResponse<Visitor>> logVisitor(
            @jakarta.validation.Valid @RequestBody com.camtix.userservice.dto.VisitorRequest request,
            org.springframework.security.core.Authentication authentication) {
        
        Long userId = null;
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal())) {
            String email = authentication.getName();
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getIdUser();
            }
        }

        visitorService.logVisitor(userId, request.getActivity());

        WebResponse<Visitor> response = WebResponse.<Visitor>builder()
                .status(true)
                .message("Visitor activity logged successfully.")
                .data(null)
                .build();
        return new ResponseEntity<>(response, org.springframework.http.HttpStatus.CREATED);
    }
}
