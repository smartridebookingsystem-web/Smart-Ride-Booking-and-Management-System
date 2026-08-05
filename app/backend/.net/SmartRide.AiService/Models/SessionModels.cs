using System.Text.Json.Serialization;

namespace SmartRide.AiService.Models;

public class ChatTurn
{
    [JsonPropertyName("userMessage")]
    public string UserMessage { get; set; } = string.Empty;

    [JsonPropertyName("aiResponse")]
    public string AiResponse { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class SessionResponse
{
    [JsonPropertyName("sessionId")]
    public string SessionId { get; set; } = string.Empty;

    [JsonPropertyName("turns")]
    public List<ChatTurn> Turns { get; set; } = new();

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
