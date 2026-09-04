package com.camtix.transactionservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Public GET endpoints for payment methods
                        .requestMatchers(HttpMethod.GET, "/api/payment-methods/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/notify").permitAll()

                        // Admin endpoints for payment methods
                        .requestMatchers(HttpMethod.POST, "/api/payment-methods/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.PUT, "/api/payment-methods/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.DELETE, "/api/payment-methods/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")

                        // Booking endpoints
                        .requestMatchers(HttpMethod.GET, "/api/bookings").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/bookings").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")

                        // Payment endpoints
                        .requestMatchers(HttpMethod.GET, "/api/payments").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.GET, "/api/payments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/payments").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/payments/*/upload-proof").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/payments/*/verify").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.PUT, "/api/payments/*/reject").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.PUT, "/api/payments/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.DELETE, "/api/payments/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")

                        // Health check
                        .requestMatchers("/actuator/health").permitAll()

                        // Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
