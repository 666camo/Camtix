package com.camtix.userservice.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(0)
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static final String[] RATE_LIMITED_PATHS = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify-otp",
            "/api/auth/resend-otp"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        boolean needsRateLimit = false;
        if ("POST".equalsIgnoreCase(method)) {
            for (String pattern : RATE_LIMITED_PATHS) {
                if (path.startsWith(pattern)) {
                    needsRateLimit = true;
                    break;
                }
            }
        }

        if (!needsRateLimit) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        Bucket bucket = buckets.computeIfAbsent(clientKey, k -> newBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for client {} on {} {}", clientKey, method, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":false,\"message\":\"Terlalu banyak permintaan. Silakan coba lagi nanti.\"}");
        }
    }

    private Bucket newBucket() {
        // Allow 5 requests per 1 minute per client IP
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientKey(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        String ip;
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            ip = xForwardedFor.split(",")[0].trim();
        } else {
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.trim().isEmpty()) {
                ip = xRealIp.trim();
            } else {
                ip = request.getRemoteAddr();
            }
        }
        String path = request.getRequestURI();
        return ip + "|" + path;
    }
}
