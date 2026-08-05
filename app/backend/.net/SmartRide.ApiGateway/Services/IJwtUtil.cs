using System.Security.Claims;

namespace SmartRide.ApiGateway.Services;

public interface IJwtUtil
{
    bool IsTokenValid(string token);
    ClaimsPrincipal? GetClaimsPrincipal(string token);
}
