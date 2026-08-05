using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SmartRide.AiService.Models;

/// <summary>
/// Request payload for the SmartRide AI Chat endpoint.
/// </summary>
public class ChatRequest
{
    /// <summary>
    /// The primary user message. Accepts aliases: 'prompt', 'text', 'query', 'userMessage'.
    /// </summary>
    [Required(ErrorMessage = "Message is required.")]
    [MaxLength(2000, ErrorMessage = "Message must not exceed 2000 characters.")]
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Optional session UUID for conversation context.
    /// </summary>
    [JsonPropertyName("sessionId")]
    public string? SessionId { get; set; }

    // Fallback Property Aliases for flexible JSON binding
    [JsonPropertyName("prompt")]
    public string? PromptAlias { set { if (!string.IsNullOrWhiteSpace(value) && string.IsNullOrWhiteSpace(Message)) Message = value; } }

    [JsonPropertyName("text")]
    public string? TextAlias { set { if (!string.IsNullOrWhiteSpace(value) && string.IsNullOrWhiteSpace(Message)) Message = value; } }

    [JsonPropertyName("query")]
    public string? QueryAlias { set { if (!string.IsNullOrWhiteSpace(value) && string.IsNullOrWhiteSpace(Message)) Message = value; } }

    [JsonPropertyName("userMessage")]
    public string? UserMessageAlias { set { if (!string.IsNullOrWhiteSpace(value) && string.IsNullOrWhiteSpace(Message)) Message = value; } }
}
