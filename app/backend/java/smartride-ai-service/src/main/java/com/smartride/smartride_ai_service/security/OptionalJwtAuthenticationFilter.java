package com.smartride.smartride_ai_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Optional JWT Authentication Filter for the SmartRide AI Service.
 *
 * This filter NEVER blocks a request. It is "optional" by design:
 *
 *   - If NO Authorization header → request proceeds as anonymous.
 *   - If Authorization header present but INVALID → request proceeds as anonymous
 *     (no 401 — this is intentional for the public AI chatbot).
 *   - If Authorization header present and VALID → userId, role, email are
 *     stored as request attributes for downstream use.
 *
 * SECURITY RULES enforced here:
 *   - userId is NEVER trusted from the request body — only from a valid JWT.
 *   - JWT is parsed and discarded — never forwarded to Gemini.
 *   - JWT is NEVER logged.
 */
@Component
public class OptionalJwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(OptionalJwtAuthenticationFilter.class);

    // Attribute keys stored on the request for downstream access
    public static final String ATTR_USER_ID    = "smartride.userId";
    public static final String ATTR_USER_ROLE  = "smartride.role";
    public static final String ATTR_USER_EMAIL = "smartride.email";
    public static final String ATTR_AUTHENTICATED = "smartride.authenticated";

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Anonymous request — proceed without blocking
            log.debug("Anonymous AI request from {}", request.getRemoteAddr());
            request.setAttribute(ATTR_AUTHENTICATED, false);
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // strip "Bearer "

        if (!jwtUtil.isTokenValid(token)) {
            // Invalid/expired token — treat as anonymous, do NOT return 401
            log.warn("AI request with invalid/expired JWT — treating as anonymous");
            request.setAttribute(ATTR_AUTHENTICATED, false);
            filterChain.doFilter(request, response);
            return;
        }

        // Valid JWT — extract identity and store as request attributes
        Integer userId = jwtUtil.extractUserId(token);
        String role    = jwtUtil.extractRole(token);
        String email   = jwtUtil.extractEmail(token);

        request.setAttribute(ATTR_USER_ID, userId);
        request.setAttribute(ATTR_USER_ROLE, role);
        request.setAttribute(ATTR_USER_EMAIL, email);
        request.setAttribute(ATTR_AUTHENTICATED, true);

        // Log authenticated access — but NEVER log the token itself
        log.info("Authenticated AI request for userId={} role={}", userId, role);

        filterChain.doFilter(request, response);
    }
}
