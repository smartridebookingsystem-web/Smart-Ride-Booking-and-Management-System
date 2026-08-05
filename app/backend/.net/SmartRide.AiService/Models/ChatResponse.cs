using System.Text.Json.Serialization;

namespace SmartRide.AiService.Models;

/// <summary>
/// Response DTO for the SmartRide AI Chat endpoint.
/// </summary>
public class ChatResponse
{
    [JsonPropertyName("response")]
    public string Response { get; set; } = string.Empty;

    [JsonPropertyName("sessionId")]
    public string? SessionId { get; set; }

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public ChatResponse() { }

    public ChatResponse(string response, string? sessionId = null)
    {
        Response = response;
        SessionId = sessionId;
    }
}
