using System.Collections.Concurrent;
using SmartRide.AiService.Models;

namespace SmartRide.AiService.Services;

public class AiSessionService
{
    private readonly ConcurrentDictionary<string, SessionResponse> _sessions = new();

    public string CreateSession()
    {
        string sessionId = Guid.NewGuid().ToString();
        var session = new SessionResponse
        {
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow
        };
        _sessions[sessionId] = session;
        return sessionId;
    }

    public void AddTurn(string sessionId, string userMessage, string aiResponse)
    {
        var session = _sessions.GetOrAdd(sessionId, id => new SessionResponse
        {
            SessionId = id,
            CreatedAt = DateTime.UtcNow
        });

        session.Turns.Add(new ChatTurn
        {
            UserMessage = userMessage,
            AiResponse = aiResponse,
            Timestamp = DateTime.UtcNow
        });
    }

    public SessionResponse? GetSession(string sessionId)
    {
        _sessions.TryGetValue(sessionId, out var session);
        return session;
    }

    public bool DeleteSession(string sessionId)
    {
        return _sessions.TryRemove(sessionId, out _);
    }
}
