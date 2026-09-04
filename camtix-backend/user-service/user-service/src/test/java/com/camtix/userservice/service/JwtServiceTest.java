package com.camtix.userservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    // 256-bit base64-encoded secret for testing
    private static final String TEST_SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
    }

    @Test
    void testGenerateAndValidateToken() {
        UserDetails userDetails = new User("testuser@camtix.com", "password", Collections.emptyList());

        String token = jwtService.generateToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isEmpty());

        String username = jwtService.extractUsername(token);
        assertEquals("testuser@camtix.com", username);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void testTokenInvalidForDifferentUser() {
        UserDetails user1 = new User("user1@camtix.com", "password", Collections.emptyList());
        UserDetails user2 = new User("user2@camtix.com", "password", Collections.emptyList());

        String token = jwtService.generateToken(user1);
        assertFalse(jwtService.isTokenValid(token, user2));
    }
}
