package com.camtix.transactionservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Payment Method ID is required")
    private Long paymentMethodId;

    @NotNull(message = "Total payment is required")
    @DecimalMin(value = "0.0", message = "Total payment cannot be negative")
    private BigDecimal totalPayment;

    private Boolean useMidtrans = false;
}
