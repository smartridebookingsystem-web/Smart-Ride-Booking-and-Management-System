package com.smartride.smartride_ai_service.dto;

/**
 * Response DTO for the AI chat endpoint.
 * Returns the AI-generated response text.
 */
public class ChatResponse {

    private String response;

    public ChatResponse() {}

    public ChatResponse(String response) {
        this.response = response;
    }

    // --- Getter & Setter ---

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
