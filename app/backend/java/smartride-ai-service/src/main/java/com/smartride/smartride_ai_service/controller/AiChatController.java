package com.smartride.smartride_ai_service.controller;

import com.smartride.smartride_ai_service.dto.ChatRequest;
import com.smartride.smartride_ai_service.dto.ChatResponse;
import com.smartride.smartride_ai_service.dto.SessionResponse;
import com.smartride.smartride_ai_service.security.OptionalJwtAuthenticationFilter;
import com.smartride.smartride_ai_service.service.AiChatService;
import com.smartride.smartride_ai_service.service.AiSessionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the SmartRide AI chatbot endpoints.
 *
 * PUBLIC ENDPOINTS (no JWT required):
 *   POST /api/ai/chat    — send a message to the AI chatbot
 *   POST /api/ai/session — create a new conversation session
 *
 * SECURITY:
 *   - userId is read ONLY from request attributes set by OptionalJwtAuthenticationFilter.
 *   - userId from the JSON request body is IGNORED to prevent impersonation.
 *   - sessionId is for context only — never used for authorization.
 *   - Stack traces and API keys are NEVER exposed in responses.
 */
@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private static final Logger log = LoggerFactory.getLogger(AiChatController.class);

    @Autowired
    private AiChatService aiChatService;

    @Autowired
    private AiSessionService aiSessionService;

    /**
     * POST /api/ai/chat
     *
     * Accepts a message from the user (anonymous or authenticated) and returns
     * the AI-generated response.
     *
     * Request body:
     *   {
     *     "message": "How can I book a ride?",
     *     "sessionId": "optional-session-uuid"
     *   }
     *
     * Response:
     *   {
     *     "response": "You can book a ride by..."
     *   }
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest chatRequest,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        // Read authenticated user identity from request attributes (set by JWT filter).
        // NEVER trust userId from the JSON request body.
        Boolean isAuthenticated = (Boolean) httpRequest.getAttribute(
                OptionalJwtAuthenticationFilter.ATTR_AUTHENTICATED);
        Integer userId = null;
        String role    = null;

        if (Boolean.TRUE.equals(isAuthenticated)) {
            userId = (Integer) httpRequest.getAttribute(OptionalJwtAuthenticationFilter.ATTR_USER_ID);
            role   = (String) httpRequest.getAttribute(OptionalJwtAuthenticationFilter.ATTR_USER_ROLE);

            log.info("Authenticated AI request for userId={}", userId);
        } else {
            log.info("Anonymous AI request received");
        }

        String aiResponse = aiChatService.chat(
                chatRequest.getMessage(),
                userId,
                role,
                chatRequest.getSessionId()
        );

        return ResponseEntity.ok(new ChatResponse(aiResponse));
    }

    /**
     * POST /api/ai/session
     *
     * Creates a new conversation session for optional chat history context.
     *
     * SECURITY: A session ID is for context only — it MUST NOT be used
     * to authorize any user-specific operation (rides, complaints, etc.).
     *
     * Response:
     *   {
     *     "sessionId": "generated-uuid"
     *   }
     */
    @PostMapping("/session")
    public ResponseEntity<SessionResponse> createSession() {
        String sessionId = aiSessionService.createSession();
        log.info("New AI session created");
        return ResponseEntity.ok(new SessionResponse(sessionId));
    }

    /**
     * GET /api/ai/health
     *
     * Simple health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<ChatResponse> health() {
        return ResponseEntity.ok(new ChatResponse("SmartRide AI Service is running."));
    }
}
