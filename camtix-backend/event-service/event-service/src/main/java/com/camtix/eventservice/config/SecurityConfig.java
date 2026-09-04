package com.camtix.eventservice.config;

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
                        // Public service-to-service endpoints for stock modification
                        .requestMatchers(HttpMethod.PUT, "/api/tickets/*/reduce-stock", "/api/tickets/*/restore-stock", "/api/tickets/**/reduce-stock", "/api/tickets/**/restore-stock").permitAll()
                        // Public GET requests
                        .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tickets/**").permitAll()
                        // Admin-only endpoints for modifying events/tickets
                        .requestMatchers(HttpMethod.POST, "/api/events/**", "/api/tickets/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.PUT, "/api/events/**", "/api/tickets/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/**", "/api/tickets/**").hasAnyRole("ADMIN_CAMTIX", "ADMIN_APLIKASI")
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
