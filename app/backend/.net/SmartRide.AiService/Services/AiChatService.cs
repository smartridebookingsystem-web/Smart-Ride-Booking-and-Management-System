using SmartRide.AiService.Models;

namespace SmartRide.AiService.Services;

public class AiChatService
{
    private readonly GoogleGeminiClient _geminiClient;
    private readonly SemanticKnowledgeSearchEngine _semanticEngine;
    private readonly AiSessionService _sessionService;
    private readonly ILogger<AiChatService> _logger;

    private const string SystemPrompt = """
        You are SmartRide AI Assistant — the official virtual assistant for SmartRide, 
        a modern web-based ride-booking and management microservice platform.

        System Knowledge & Codebase Facts:
        - Ride Booking Steps:
          1) Open Rider Portal (http://localhost:5175).
          2) Select Pickup and Dropoff locations on the interactive map.
          3) Choose vehicle category: Hatchback (Economy), Sedan (Comfort), or SUV (Premium).
          4) Select payment method: Cash, SmartRide Wallet, Credit/Debit Card, or UPI.
          5) Click 'Book Ride'. Share the generated 4-digit OTP with your driver upon pickup.
        - Vehicle Categories & Fare Rates:
          * Hatchback (Economy): Base ₹50 + ₹12/km (up to 4 passengers)
          * Sedan (Comfort): Base ₹80 + ₹16/km (up to 4 passengers)
          * SUV (Premium): Base ₹120 + ₹22/km (up to 6 passengers)
          * Total Fare Formula: Base Fare + (Distance in km × Rate per km)
        - Driver Portal (http://localhost:5174):
          * Drivers register and upload mandatory documents: Driving License, Vehicle RC, Aadhaar ID, and Photo.
          * Driver status starts as PENDING_APPROVAL.
          * After Admin approval, drivers toggle Online to receive nearby ride requests, enter rider's 4-digit OTP to start trip, complete trip, and view earnings.
        - Admin Dashboard (http://localhost:5173):
          * Review pending driver document uploads (PDF/Images).
          * Approve or reject driver accounts.
          * Manage riders and drivers, track active rides, and view revenue analytics.
        - Payments & Digital Wallet:
          * Riders can top up SmartRide Wallet via UPI or Card.
          * Wallet auto-deducts fare seamlessly on trip completion. Full transaction ledger in Rider Dashboard.
        - Support & Lost Items:
          * Report lost items under 'My Bookings' on http://localhost:5175.
          * In-app Emergency SOS available during active rides.

        Response Guidelines:
        - Give concise, helpful, friendly, and structured responses.
        - Do not include raw markdown asterisks (**) in your output text.
        - Be professional and empathetic.
        - If a user asks something unrelated to SmartRide, politely explain: "I am designed to assist with SmartRide ride booking, driver onboarding, and platform services."
        """;

    public AiChatService(
        GoogleGeminiClient geminiClient,
        SemanticKnowledgeSearchEngine semanticEngine,
        AiSessionService sessionService,
        ILogger<AiChatService> logger)
    {
        _geminiClient = geminiClient;
        _semanticEngine = semanticEngine;
        _sessionService = sessionService;
        _logger = logger;
    }

    public async Task<string> ProcessChatAsync(string message, int? userId, string? role, string? sessionId)
    {
        // 1. Perform Semantic Search to retrieve relevant knowledge chunks
        var relevantChunks = _semanticEngine.Search(message, 2);

        string semanticContext = string.Join("\n\n", relevantChunks.Select(c => $"[{c.Title}]\n{c.Content}"));

        string contextPrefix = BuildContextPrefix(userId, role);
        string userPrompt = string.IsNullOrWhiteSpace(semanticContext)
            ? (string.IsNullOrWhiteSpace(contextPrefix) ? message : $"{contextPrefix}\n\nUser Question: {message}")
            : $"{contextPrefix}\n\n[Retrieved Semantic Knowledge]:\n{semanticContext}\n\nUser Question: {message}";

        // 2. Attempt Google Gemini AI Generation
        string? geminiResponse = await _geminiClient.GenerateContentAsync(SystemPrompt, userPrompt);

        string finalResponse;
        if (!string.IsNullOrWhiteSpace(geminiResponse))
        {
            _logger.LogInformation("Generated response via Google Gemini AI.");
            finalResponse = geminiResponse;
        }
        else
        {
            _logger.LogInformation("Using Semantic Search Knowledge Engine fallback.");
            finalResponse = BuildSemanticSearchResponse(relevantChunks, message);
        }

        // 3. Save turn to session history
        if (!string.IsNullOrWhiteSpace(sessionId))
        {
            _sessionService.AddTurn(sessionId, message, finalResponse);
        }

        return finalResponse;
    }

    private string BuildSemanticSearchResponse(List<KnowledgeChunk> chunks, string query)
    {
        if (chunks == null || chunks.Count == 0)
        {
            return "Hello! 👋 I'm SmartRide AI Assistant. I can help you with booking rides, fare estimation, driver onboarding, payments, wallet top-ups, and support. What would you like to know?";
        }

        var topChunk = chunks[0];
        return $"📌 {topChunk.Title}:\n\n{topChunk.Content.Trim()}";
    }

    private string BuildContextPrefix(int? userId, string? role)
    {
        if (!userId.HasValue) return string.Empty;
        string friendlyRole = role?.ToUpper() switch
        {
            "ROLE_ADMIN" or "ADMIN" => "administrator",
            "ROLE_DRIVER" or "DRIVER" => "driver",
            "ROLE_RIDER" or "RIDER" or "USER" => "rider",
            _ => "user"
        };
        return $"[Context: Message from authenticated SmartRide {friendlyRole} (ID: {userId}).]";
    }
}
