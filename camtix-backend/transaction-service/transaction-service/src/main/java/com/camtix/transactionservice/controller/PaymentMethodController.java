package com.camtix.transactionservice.controller;

import com.camtix.transactionservice.dto.PaymentMethodRequest;
import com.camtix.transactionservice.dto.PaymentMethodResponse;
import com.camtix.transactionservice.dto.WebResponse;
import com.camtix.transactionservice.service.PaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<WebResponse<List<PaymentMethodResponse>>> getAllPaymentMethods(
            @RequestParam(value = "activeOnly", defaultValue = "true") Boolean activeOnly
    ) {
        List<PaymentMethodResponse> methods = paymentMethodService.getAllPaymentMethods(activeOnly);
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
