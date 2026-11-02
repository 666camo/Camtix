package com.camtix.userservice.controller;

import com.camtix.userservice.config.JwtAuthenticationFilter;
import com.camtix.userservice.config.SecurityConfig;
import com.camtix.userservice.entity.User;
import com.camtix.userservice.service.JwtService;
import com.camtix.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {InternalUserController.class, UserController.class},
        properties = "internal.api.key=test-shared-key")
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class InternalUserControllerTest {
    @Autowired MockMvc mvc;
    @Autowired InternalUserController controller;
    @MockBean UserService userService;
    @MockBean JwtService jwtService;
    @MockBean UserDetailsService userDetailsService;
    private static final String ENDPOINT = "/api/internal/users/27/ticket-recipient";

    private User sample() {
        return User.builder().idUser(27L).email("buyer@example.com").firstName("Nadia").lastName("Putri")
                .password("private-password").refreshToken("private-token").resetPasswordToken("private-reset")
                .address("Private address").role("USER").build();
    }

    @Test
    void validInternalKeyReturnsOnlyTicketRecipientFields() throws Exception {
        when(userService.getUserById(27L)).thenReturn(sample());
        mvc.perform(get(ENDPOINT).header("X-Internal-Api-Key", "test-shared-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("buyer@example.com"))
                .andExpect(jsonPath("$.data.firstName").value("Nadia"))
                .andExpect(jsonPath("$.data.lastName").value("Putri"))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.resetPasswordToken").doesNotExist())
                .andExpect(jsonPath("$.data.address").doesNotExist())
                .andExpect(jsonPath("$.data.role").doesNotExist());
        verify(userService).getUserById(27L);
    }

    @Test
    void missingOrWrongKeyIsRejectedBeforeUserLookup() throws Exception {
        mvc.perform(get(ENDPOINT)).andExpect(status().isUnauthorized());
        mvc.perform(get(ENDPOINT).header("X-Internal-Api-Key", "wrong-key")).andExpect(status().isUnauthorized());
        mvc.perform(get(ENDPOINT).header("X-Internal-Api-Key", "")).andExpect(status().isUnauthorized());
        verifyNoInteractions(userService);
    }

    @Test
    void blankServerKeyFailsClosed() throws Exception {
        ReflectionTestUtils.setField(controller, "internalApiKey", "");
        try {
            mvc.perform(get(ENDPOINT).header("X-Internal-Api-Key", "test-shared-key"))
                    .andExpect(status().isUnauthorized());
            verifyNoInteractions(userService);
        } finally { ReflectionTestUtils.setField(controller, "internalApiKey", "test-shared-key"); }
    }

    @Test
    void internalKeyDoesNotGrantAdminOrWriteAccess() throws Exception {
        mvc.perform(get("/api/users/27").header("X-Internal-Api-Key", "test-shared-key"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/users").header("X-Internal-Api-Key", "test-shared-key"))
                .andExpect(status().isForbidden());
        mvc.perform(post(ENDPOINT).header("X-Internal-Api-Key", "test-shared-key"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(userService);
    }

    @Test
    void buyerJwtCannotReadAnotherUserOrReplaceInternalKey() throws Exception {
        authenticate("buyer-token", "USER");
        mvc.perform(get("/api/users/27").header("Authorization", "Bearer buyer-token"))
                .andExpect(status().isForbidden());
        mvc.perform(get(ENDPOINT).header("Authorization", "Bearer buyer-token"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(userService);
    }

    @Test
    void existingAdminUserLookupStillWorks() throws Exception {
        authenticate("admin-token", "ADMIN_CAMTIX");
        when(userService.getUserById(27L)).thenReturn(sample());
        mvc.perform(get("/api/users/27").header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());
    }

    private void authenticate(String token, String role) {
        var details = org.springframework.security.core.userdetails.User.withUsername("preview@example.com")
                .password("unused").roles(role).build();
        when(jwtService.extractUsername(token)).thenReturn("preview@example.com");
        when(userDetailsService.loadUserByUsername("preview@example.com")).thenReturn(details);
        when(jwtService.isTokenValid(token, details)).thenReturn(true);
    }
}
