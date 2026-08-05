package com.smartride.smartride_ai_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

/**
 * JWT utility for the AI service.
 *
 * Uses the same shared secret as auth-service and api-gateway to validate
 * the SmartRide JWT.  This enables the AI service to optionally identify
 * logged-in users without creating a second auth system.
 *
 * SECURITY: The JWT secret is injected from environment variable JWT_SECRET.
 * It is NEVER logged or exposed.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Returns true if the token signature is valid and not expired.
     * Returns false for any invalid/malformed/expired token — never throws.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts all claims from a valid token.
     * Only call this after isTokenValid() returns true.
     */
    public Claims getAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts the userId claim (Integer) from a valid token.
     */
    public Integer extractUserId(String token) {
        Claims claims = getAllClaims(token);
        Object userId = claims.get("userId");
        if (userId instanceof Integer) {
            return (Integer) userId;
        }
        if (userId instanceof Number) {
            return ((Number) userId).intValue();
        }
        return null;
    }

    /**
     * Extracts the role claim (String) from a valid token.
     */
    public String extractRole(String token) {
        return getAllClaims(token).get("role", String.class);
    }

    /**
     * Extracts the email (JWT subject) from a valid token.
     */
    public String extractEmail(String token) {
        return getAllClaims(token).getSubject();
    }
}
