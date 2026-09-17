package com.camtix.transactionservice.controller;

import com.camtix.transactionservice.dto.PaymentMethodRequest;
import com.camtix.transactionservice.dto.PaymentMethodResponse;
import com.camtix.transactionservice.dto.WebResponse;
import com.camtix.transactionservice.service.PaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<WebResponse<?>> getAllPaymentMethods(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(value = "activeOnly", required = false) Boolean activeOnly,
            @RequestParam(required = false, defaultValue = "idPaymentMethod") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction
    ) {
        int pageSize = size != null ? size : (limit != null ? limit : 0);

        if (page != null || pageSize > 0) {
            int pageNumber = page != null ? Math.max(0, page) : 0;
            int effectiveSize = pageSize > 0 ? pageSize : 10;
            Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(pageNumber, effectiveSize, Sort.by(sortDirection, sortBy != null ? sortBy : "idPaymentMethod"));

            Page<PaymentMethodResponse> methodsPage = paymentMethodService.getAllPaymentMethodsPaged(search, activeOnly, pageable);
            WebResponse<Object> response = WebResponse.<Object>builder()
                    .status(true)
                    .message("Successfully retrieved payment methods with pagination.")
                    .data(methodsPage)
                    .build();
            return ResponseEntity.ok(response);
        }

        List<PaymentMethodResponse> methods = paymentMethodService.getAllPaymentMethods(activeOnly != null ? activeOnly : true);
        WebResponse<List<PaymentMethodResponse>> response = WebResponse.<List<PaymentMethodResponse>>builder()
                .status(true)
                .message("Successfully retrieved payment methods.")
                .data(methods)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebResponse<PaymentMethodResponse>> getPaymentMethodById(@PathVariable Long id) {
        PaymentMethodResponse method = paymentMethodService.getPaymentMethodById(id);
        WebResponse<PaymentMethodResponse> response = WebResponse.<PaymentMethodResponse>builder()
                .status(true)
                .message("Successfully retrieved payment method details.")
                .data(method)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WebResponse<PaymentMethodResponse>> createPaymentMethod(@Valid @RequestBody PaymentMethodRequest request) {
        PaymentMethodResponse method = paymentMethodService.createPaymentMethod(request);
        WebResponse<PaymentMethodResponse> response = WebResponse.<PaymentMethodResponse>builder()
                .status(true)
                .message("Payment method successfully created.")
                .data(method)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebResponse<PaymentMethodResponse>> updatePaymentMethod(
            @PathVariable Long id,
            @Valid @RequestBody PaymentMethodRequest request
    ) {
        PaymentMethodResponse method = paymentMethodService.updatePaymentMethod(id, request);
        WebResponse<PaymentMethodResponse> response = WebResponse.<PaymentMethodResponse>builder()
                .status(true)
                .message("Payment method successfully updated.")
                .data(method)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<WebResponse<PaymentMethodResponse>> patchPaymentMethod(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates
    ) {
        PaymentMethodResponse method = paymentMethodService.patchPaymentMethod(id, updates);
        WebResponse<PaymentMethodResponse> response = WebResponse.<PaymentMethodResponse>builder()
                .status(true)
                .message("Payment method partially updated.")
                .data(method)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WebResponse<Void>> deletePaymentMethod(@PathVariable Long id) {
        paymentMethodService.deletePaymentMethod(id);
        WebResponse<Void> response = WebResponse.<Void>builder()
                .status(true)
                .message("Payment method successfully deleted.")
                .build();
        return ResponseEntity.ok(response);
    }
}
