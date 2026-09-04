package com.camtix.transactionservice.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Value("${email.exchange.name}")
    private String exchangeName;

    @Value("${email.routing.key}")
    private String routingKey;

    public void sendEmailMessage(String toEmail, String subject, String messageBody) {
        try {
            Map<String, String> map = new HashMap<>();
            map.put("to", toEmail);
            map.put("subject", subject);
            map.put("message", messageBody);

            String jsonMessage = objectMapper.writeValueAsString(map);
            rabbitTemplate.convertAndSend(exchangeName, routingKey, jsonMessage);
            log.info("Successfully published async email message to RabbitMQ for: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to publish email message to RabbitMQ for {}", toEmail, e);
        }
    }
}
