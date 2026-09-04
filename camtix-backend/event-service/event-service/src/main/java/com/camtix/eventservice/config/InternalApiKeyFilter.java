package com.camtix.eventservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
@Slf4j
public class InternalApiKeyFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-Internal-Api-Key";

    @Value("${internal.api.key}")
    private String validApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        if (requestURI.contains("/reduce-stock") || requestURI.contains("/restore-stock")) {
            String apiKey = request.getHeader(API_KEY_HEADER);
            if (validApiKey == null || validApiKey.trim().isEmpty() || apiKey == null || !apiKey.equals(validApiKey.trim())) {
                log.warn("Invalid or missing internal API key for stock operation from IP: {}", request.getRemoteAddr());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid internal API key");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }
}
