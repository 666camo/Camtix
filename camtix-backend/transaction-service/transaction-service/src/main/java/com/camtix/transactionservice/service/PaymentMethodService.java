package com.camtix.transactionservice.service;

import com.camtix.transactionservice.dto.PaymentMethodRequest;
import com.camtix.transactionservice.dto.PaymentMethodResponse;
import com.camtix.transactionservice.entity.PaymentMethod;
import com.camtix.transactionservice.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getAllPaymentMethods(Boolean activeOnly) {
        List<PaymentMethod> methods;
        if (Boolean.TRUE.equals(activeOnly)) {
            methods = paymentMethodRepository.findByIsActiveTrue();
        } else {
            methods = paymentMethodRepository.findAll();
        }
        return methods.stream()
                .map(this::mapToPaymentMethodResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentMethodResponse getPaymentMethodById(Long id) {
        PaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with ID: " + id));
        return mapToPaymentMethodResponse(method);
    }

    @Transactional
    public PaymentMethodResponse createPaymentMethod(PaymentMethodRequest request) {
        Boolean active = request.getIsActive();
        if (active == null) {
            active = true;
        }

        PaymentMethod method = PaymentMethod.builder()
                .methodName(request.getMethodName())
                .provider(request.getProvider())
                .accountNumber(request.getAccountNumber())
                .accountName(request.getAccountName())
                .qrImage(request.getQrImage())
                .isActive(active)
                .build();

        PaymentMethod savedMethod = paymentMethodRepository.save(method);
        return mapToPaymentMethodResponse(savedMethod);
    }

    @Transactional
    public PaymentMethodResponse updatePaymentMethod(Long id, PaymentMethodRequest request) {
        PaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment method not found with ID: " + id));

        Boolean active = request.getIsActive();
        if (active == null) {
            active = true;
        }

        method.setMethodName(request.getMethodName());
        method.setProvider(request.getProvider());
        method.setAccountNumber(request.getAccountNumber());
        method.setAccountName(request.getAccountName());
        method.setQrImage(request.getQrImage());
        method.setIsActive(active);

        PaymentMethod updatedMethod = paymentMethodRepository.save(method);
        return mapToPaymentMethodResponse(updatedMethod);
    }

    @Transactional
    public void deletePaymentMethod(Long id) {
        if (!paymentMethodRepository.existsById(id)) {
            throw new IllegalArgumentException("Payment method not found with ID: " + id);
        }
        paymentMethodRepository.deleteById(id);
    }

    private PaymentMethodResponse mapToPaymentMethodResponse(PaymentMethod method) {
        return PaymentMethodResponse.builder()
                .idPaymentMethod(method.getIdPaymentMethod())
                .methodName(method.getMethodName())
                .provider(method.getProvider())
                .accountNumber(method.getAccountNumber())
                .accountName(method.getAccountName())
                .qrImage(method.getQrImage())
                .isActive(method.getIsActive())
                .build();
    }
}
