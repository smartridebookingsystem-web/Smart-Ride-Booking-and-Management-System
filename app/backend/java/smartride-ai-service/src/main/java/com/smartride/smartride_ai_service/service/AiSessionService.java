package com.smartride.smartride_ai_service.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory session management service for the SmartRide AI chatbot.
 *
 * Sessions provide optional conversation context (history) so the AI
 * can remember the thread of a conversation within a browser session.
 *
 * SECURITY RULES:
 *   - Session IDs are for CONTEXT ONLY — NOT authentication.
 *   - A sessionId MUST NOT be used to authorize user-specific operations.
 *   - Any ride cancellation, user data access, or complaint creation must
 *     be authorized by a verified JWT, not by a session ID.
 *
 * Implementation:
 *   - In-memory ConcurrentHashMap (suitable for single-instance dev/demo).
 *   - For production, replace with Redis or a distributed cache.
 *   - Sessions are not persisted across restarts.
 */
@Service
public class AiSessionService {

    // sessionId → list of conversation turns (for future memory implementation)
    private final Map<String, List<String>> sessionStore = new ConcurrentHashMap<>();

    /**
     * Creates a new session and returns its UUID.
     */
    public String createSession() {
        String sessionId = UUID.randomUUID().toString();
        sessionStore.put(sessionId, new ArrayList<>());
        return sessionId;
    }

    /**
     * Returns true if a session with the given ID exists.
     */
    public boolean sessionExists(String sessionId) {
        return sessionId != null && sessionStore.containsKey(sessionId);
    }

    /**
     * Appends a turn to the session history.
     * Format: "USER: <msg>" or "AI: <msg>"
     */
    public void addTurn(String sessionId, String userMessage, String aiResponse) {
        if (sessionId != null && sessionStore.containsKey(sessionId)) {
            List<String> history = sessionStore.get(sessionId);
            history.add("USER: " + userMessage);
            history.add("AI: " + aiResponse);
        }
    }

    /**
     * Returns the conversation history for a session.
     * Returns an empty list if the session does not exist.
     */
    public List<String> getHistory(String sessionId) {
        if (sessionId == null || !sessionStore.containsKey(sessionId)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(sessionStore.get(sessionId));
    }
}
