using SmartRide.ApiGateway.Services;

namespace SmartRide.ApiGateway.Middleware;

public class JwtAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly string[] OpenEndpoints = new[]
    {
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/send-otp",
        "/api/auth/verify-otp",
        "/api/auth/check-availability",
        "/api/users",
        "/api/rides",
        "/api/payments",
        "/api/ai",
        "/swagger"
    };

    public JwtAuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IJwtUtil jwtUtil)
    {
        // Bypass OPTIONS preflight requests
        if (HttpMethods.IsOptions(context.Request.Method))
        {
            await _next(context);
            return;
        }

        string path = context.Request.Path.Value ?? string.Empty;

        // Check if path is public / non-secured
        bool isPublic = OpenEndpoints.Any(openPath => path.Contains(openPath, StringComparison.OrdinalIgnoreCase));

        if (!isPublic)
        {
            string? authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Authorization header is missing or invalid" });
                return;
            }

            string token = authHeader.Substring(7).Trim();
            if (!jwtUtil.IsTokenValid(token))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid or expired JWT token" });
                return;
            }

            var principal = jwtUtil.GetClaimsPrincipal(token);
            if (principal != null)
            {
                string userId = principal.FindFirst("userId")?.Value ?? string.Empty;
                string role = principal.FindFirst("role")?.Value ?? string.Empty;
                string email = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? principal.FindFirst("email")?.Value
                    ?? string.Empty;

                context.Request.Headers["X-User-Id"] = userId;
                context.Request.Headers["X-User-Role"] = role;
                context.Request.Headers["X-User-Email"] = email;
            }
        }

        await _next(context);
    }
}
