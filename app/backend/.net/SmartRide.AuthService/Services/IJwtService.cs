using System.Security.Claims;

namespace SmartRide.AuthService.Services;

public interface IJwtService
{
    string GenerateToken(int userId, string username, string? email, string role);
    bool ValidateToken(string token);
    ClaimsPrincipal? GetClaimsPrincipal(string token);
    int ExtractUserId(string token);
    string ExtractUsername(string token);
    string ExtractRole(string token);
    string ExtractSubject(string token);
}
