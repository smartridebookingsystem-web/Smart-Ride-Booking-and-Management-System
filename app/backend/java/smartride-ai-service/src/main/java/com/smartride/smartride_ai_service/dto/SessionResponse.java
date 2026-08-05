package com.smartride.smartride_ai_service.dto;

/**
 * Response DTO for the POST /api/ai/session endpoint.
 * Returns a new session ID for optional conversation context tracking.
 *
 * IMPORTANT: sessionId is for context only — NOT for authentication.
 */
public class SessionResponse {

    private String sessionId;

    public SessionResponse() {}

    public SessionResponse(String sessionId) {
        this.sessionId = sessionId;
    }

    // --- Getter & Setter ---

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
