package com.camtix.userservice.controller;

import com.camtix.userservice.dto.VisitorRequest;
import com.camtix.userservice.dto.WebResponse;
import com.camtix.userservice.entity.Visitor;
import com.camtix.userservice.repository.UserRepository;
import com.camtix.userservice.service.VisitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<WebResponse<?>> getAllVisitors(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "visitDate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String direction
    ) {
        int pageSize = size != null ? size : (limit != null ? limit : 0);

        if (page != null || pageSize > 0) {
            int pageNumber = page != null ? Math.max(0, page) : 0;
            int effectiveSize = pageSize > 0 ? pageSize : 10;
            Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(pageNumber, effectiveSize, Sort.by(sortDirection, sortBy != null ? sortBy : "visitDate"));

            Page<Visitor> visitorsPage = visitorService.getAllVisitorsPaged(search, pageable);
            WebResponse<Object> response = WebResponse.<Object>builder()
                    .status(true)
                    .message("Successfully retrieved visitors with pagination.")
                    .data(visitorsPage)
                    .build();
            return ResponseEntity.ok(response);
        }

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
            @Valid @RequestBody VisitorRequest request,
            Authentication authentication) {

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
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
