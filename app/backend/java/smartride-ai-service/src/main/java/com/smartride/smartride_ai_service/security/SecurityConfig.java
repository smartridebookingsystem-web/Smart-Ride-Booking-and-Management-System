package com.smartride.smartride_ai_service.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration for the SmartRide AI Service.
 *
 * SECURITY DESIGN:
 *   - All /api/ai/** endpoints are PUBLICLY accessible (no JWT required).
 *   - The OptionalJwtAuthenticationFilter runs on every request to extract
 *     user identity IF a valid JWT is present — but NEVER blocks access.
 *   - No session management (stateless microservice).
 *   - CSRF disabled (REST API, stateless).
 *   - CORS configured for React frontend origins.
 *
 * NOTE: Do NOT add Spring Security form login or basic auth — the AI service
 * must NOT create a second authentication system.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OptionalJwtAuthenticationFilter optionalJwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/ai/**", "/actuator/**", "/error").permitAll()
                .anyRequest().permitAll()
            )
            .addFilterBefore(
                optionalJwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
