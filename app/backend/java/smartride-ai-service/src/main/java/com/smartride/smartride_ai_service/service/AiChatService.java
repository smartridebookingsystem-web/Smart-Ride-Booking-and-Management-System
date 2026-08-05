package com.smartride.smartride_ai_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core AI chat service for SmartRide.
 *
 * Integrates Semantic Search & Retrieval-Augmented Generation (RAG)
 * powered by Google Gemini and local Vector Space Similarity Engine.
 *
 * SECURITY:
 *   - userId and role are extracted from the trusted JWT only (via filter attributes).
 *   - They are used to shape context/logging — NOT included in the Gemini prompt as-is.
 *   - The raw JWT is NEVER sent to Gemini.
 *   - Gemini API key is NEVER logged or returned to the client.
 *
 * FUTURE TOOL CALLING:
 *   This service is designed to easily add Spring AI Tool Calling later.
 *   Add @Tool-annotated components (RideTools, DriverTools, SupportTools)
 *   and register them via ChatClient builder or .tools() on the call.
 */
@Service
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private AiSessionService sessionService;

    @Autowired
    private SemanticKnowledgeSearchEngine semanticSearchEngine;

    /**
     * Handles a chat request using Semantic Search (RAG) and Gemini AI.
     */
    public String chat(String message, Integer userId, String role, String sessionId) {

        // 1. Perform Semantic Search to retrieve relevant knowledge chunks
        List<SemanticKnowledgeSearchEngine.KnowledgeChunk> relevantChunks =
                semanticSearchEngine.search(message, 2);

        String semanticContext = relevantChunks.stream()
                .map(c -> "[" + c.title() + "]\n" + c.content())
                .collect(Collectors.joining("\n\n"));

        // 2. Build RAG prompt with semantic context
        String contextPrefix = buildContextPrefix(userId, role);
        String ragPrompt = semanticContext.isEmpty()
                ? (contextPrefix.isEmpty() ? message : contextPrefix + "\n\nUser Question: " + message)
                : contextPrefix + "\n\n[Retrieved Semantic Knowledge]:\n" + semanticContext + "\n\nUser Question: " + message;

        try {
            log.info("AI RAG request received | authenticated={} | chunksRetrieved={}",
                    userId != null, relevantChunks.size());

            String aiResponse = chatClient
                    .prompt()
                    .user(ragPrompt)
                    .call()
                    .content();

            log.info("AI response generated successfully | userId={}",
                    userId != null ? userId : "anonymous");

            if (sessionId != null) {
                sessionService.addTurn(sessionId, message, aiResponse);
            }

            return aiResponse;

        } catch (Exception e) {
            log.warn("Gemini API unavailable ({}). Returning RAG Semantic Search result.", e.getMessage());

            // 3. Fallback: Return semantically retrieved knowledge chunks
            String ragResponse = buildSemanticSearchResponse(relevantChunks, message);

            if (sessionId != null) {
                sessionService.addTurn(sessionId, message, ragResponse);
            }

            return ragResponse;
        }
    }

    /**
     * Builds a natural response from top semantic search matches.
     */
    private String buildSemanticSearchResponse(List<SemanticKnowledgeSearchEngine.KnowledgeChunk> chunks, String originalQuery) {
        if (chunks == null || chunks.isEmpty()) {
            return "Hello! 👋 I'm SmartRide AI Assistant. I can help you with booking rides, fare estimation, driver onboarding, payments, wallet top-ups, and support. What would you like to know?";
        }

        StringBuilder sb = new StringBuilder();
        for (SemanticKnowledgeSearchEngine.KnowledgeChunk chunk : chunks) {
            sb.append(chunk.title()).append(":\n");
            sb.append(chunk.content().trim()).append("\n\n");
        }
        return sb.toString().trim();
    }

    /**
     * Builds an optional context prefix for the AI prompt based on authenticated user info.
     *
     * SECURITY: Only high-level, non-sensitive context is added (role, userId).
     * The raw JWT, email, or personal data are NOT included in the Gemini prompt.
     */
    private String buildContextPrefix(Integer userId, String role) {
        if (userId == null) {
            return ""; // anonymous user — no context prefix
        }

        // Provide minimal, safe context to the AI
        String friendlyRole = mapRoleToFriendly(role);
        return String.format(
                "[Context: This message is from an authenticated SmartRide %s (ID: %d). " +
                "You may provide user-specific guidance appropriate for a %s.]",
                friendlyRole, userId, friendlyRole
        );
    }

    /**
     * Maps internal role strings to user-friendly descriptions for the AI prompt.
     */
    private String mapRoleToFriendly(String role) {
        if (role == null) return "user";
        return switch (role.toUpperCase()) {
            case "ROLE_ADMIN", "ADMIN" -> "administrator";
            case "ROLE_DRIVER", "DRIVER" -> "driver";
            case "ROLE_RIDER", "RIDER", "ROLE_USER", "USER" -> "rider";
            default -> "user";
        };
    }
}
