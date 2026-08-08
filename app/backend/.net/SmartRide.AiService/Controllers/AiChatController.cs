using Microsoft.AspNetCore.Mvc;
using SmartRide.AiService.Models;
using SmartRide.AiService.Services;

namespace SmartRide.AiService.Controllers;

[ApiController]
[Route("api/ai")]
[Produces("application/json")]
public class AiChatController : ControllerBase
{
    private readonly AiChatService _aiChatService;
    private readonly AiSessionService _sessionService;
    private readonly ILogger<AiChatController> _logger;

    public AiChatController(
        AiChatService aiChatService,
        AiSessionService sessionService,
        ILogger<AiChatController> logger)
    {
        _aiChatService = aiChatService;
        _sessionService = sessionService;
        _logger = logger;
    }

    /// <summary>
    /// Send a message to SmartRide AI Assistant (Publicly accessible).
    /// </summary>
    /// <param name="request">Chat message request payload.</param>
    /// <returns>AI response string and session ID.</returns>
    [HttpPost("chat")]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Message must not be blank and must not exceed 2000 characters." });
        }

        int? userId = null;
        string? role = null;

        if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) &&
            int.TryParse(userIdHeader.FirstOrDefault(), out int parsedUserId))
        {
            userId = parsedUserId;
        }

        if (Request.Headers.TryGetValue("X-User-Role", out var roleHeader))
        {
            role = roleHeader.FirstOrDefault();
        }

        _logger.LogInformation("Processing chat request. UserID: {UserId}, SessionID: {SessionId}", userId, request.SessionId);

        string aiResponse = await _aiChatService.ProcessChatAsync(request.Message, userId, role, request.SessionId);

        return Ok(new ChatResponse(aiResponse, request.SessionId));
    }

    /// <summary>
    /// Create a new chat conversation session.
    /// </summary>
    [HttpPost("session")]
    [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status200OK)]
    public IActionResult CreateSession()
    {
        string sessionId = _sessionService.CreateSession();
        var session = _sessionService.GetSession(sessionId);
        return Ok(session);
    }

    /// <summary>
    /// Get chat conversation history for a session.
    /// </summary>
    [HttpGet("session/{sessionId}")]
    [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetSession(string sessionId)
    {
        var session = _sessionService.GetSession(sessionId);
        if (session == null)
        {
            return NotFound(new { message = $"Session '{sessionId}' not found." });
        }
        return Ok(session);
    }

    /// <summary>
    /// Delete a chat conversation session.
    /// </summary>
    [HttpDelete("session/{sessionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteSession(string sessionId)
    {
        bool deleted = _sessionService.DeleteSession(sessionId);
        if (!deleted)
        {
            return NotFound(new { message = $"Session '{sessionId}' not found." });
        }
        return Ok(new { message = $"Session '{sessionId}' successfully deleted." });
    }

    /// <summary>
    /// Health check endpoint.
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    public IActionResult Health()
    {
        return Ok(new ChatResponse("SmartRide AI Service is running.", null));
    }
}
