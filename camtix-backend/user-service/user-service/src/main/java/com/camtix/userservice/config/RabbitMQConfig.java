package com.camtix.userservice.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${email.queue.name}")
    private String queueName;

    @Value("${email.exchange.name}")
    private String exchangeName;

    @Value("${email.routing.key}")
    private String routingKey;

    @Bean
    public Queue emailQueue() {
        return new Queue(queueName, false);
    }

    @Bean
    public DirectExchange emailExchange() {
        return new DirectExchange(exchangeName);
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange emailExchange) {
        return BindingBuilder.bind(emailQueue).to(emailExchange).with(routingKey);
    }
}
