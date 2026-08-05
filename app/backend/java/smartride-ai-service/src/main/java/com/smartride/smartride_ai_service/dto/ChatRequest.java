package com.smartride.smartride_ai_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for the AI chat endpoint.
 *
 * message   - Required. The user's question or message.
 * sessionId - Optional. UUID for conversation context (NOT used for auth).
 */
public class ChatRequest {

    @NotBlank(message = "Message must not be blank")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    @JsonAlias({"prompt", "text", "query", "userMessage"})
    private String message;

    private String sessionId; // optional — for conversation context only

    // --- Getters & Setters ---

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
