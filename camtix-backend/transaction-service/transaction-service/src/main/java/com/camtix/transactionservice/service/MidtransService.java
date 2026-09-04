package com.camtix.transactionservice.service;

import com.midtrans.Config;
import com.midtrans.ConfigFactory;
import com.midtrans.service.MidtransSnapApi;
import com.midtrans.httpclient.error.MidtransError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class MidtransService {

    @Value("${midtrans.server-key}")
    private String serverKey;

    @Value("${midtrans.client-key}")
    private String clientKey;

    @Value("${midtrans.is-production:false}")
    private boolean isProduction;

    public static class MidtransSnapData {
        public String token;
        public String redirectUrl;
        public String orderId;

        public MidtransSnapData(String token, String redirectUrl, String orderId) {
            this.token = token;
            this.redirectUrl = redirectUrl;
            this.orderId = orderId;
        }
    }

    public MidtransSnapData createSnapTransaction(Long bookingId, java.math.BigDecimal grossAmount, String customerEmail, String customerName) {
        String orderId = "CAMTIX-" + bookingId + "-" + UUID.randomUUID().toString().substring(0, 8);

        Config config = Config.builder()
                .setServerKey(serverKey)
                .setClientKey(clientKey)
                .setIsProduction(isProduction)
                .build();

        MidtransSnapApi snapApi = new ConfigFactory(config).getSnapApi();

        Map<String, Object> params = new HashMap<>();
        params.put("transaction_details", new HashMap<String, Object>() {{
            put("order_id", orderId);
            put("gross_amount", grossAmount.longValue());
        }});

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("email", customerEmail);
        customerDetails.put("first_name", customerName);
        params.put("customer_details", customerDetails);

        params.put("callbacks", new HashMap<String, String>() {{
            put("finish", "/payment/finish");
        }});

        try {
            String snapToken = snapApi.createTransactionToken(params);
            String redirectUrl;
            if (isProduction) {
                redirectUrl = "https://app.midtrans.com/snap/v2/vtweb/" + snapToken;
            } else {
                redirectUrl = "https://app.sandbox.midtrans.com/snap/v2/vtweb/" + snapToken;
            }
            log.info("Generated Midtrans snap token for Booking ID {}: orderId={}", bookingId, orderId);
            return new MidtransSnapData(snapToken, redirectUrl, orderId);
        } catch (MidtransError e) {
            log.error("Failed to create Midtrans snap token: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Midtrans API exception: {}", e.getMessage());
            return null;
        }
    }
}
