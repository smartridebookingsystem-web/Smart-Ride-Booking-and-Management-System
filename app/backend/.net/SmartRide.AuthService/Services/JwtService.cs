using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SmartRide.AuthService.Services;

public class JwtService : IJwtService
{
    private readonly string _secret;
    private readonly long _expirationMs;

    public JwtService(IConfiguration configuration)
    {
        _secret = configuration["Jwt:Secret"]
            ?? "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        _expirationMs = configuration.GetValue<long>("Jwt:ExpirationMs", 86400000);
    }

    private SecurityKey GetSigningKey()
    {
        byte[] keyBytes;
        try
        {
            keyBytes = Convert.FromBase64String(_secret);
        }
        catch
        {
            keyBytes = Encoding.UTF8.GetBytes(_secret);
        }
        return new SymmetricSecurityKey(keyBytes);
    }

    public string GenerateToken(int userId, string username, string? email, string role)
    {
        var claims = new List<Claim>
        {
            new Claim("userId", userId.ToString()),
            new Claim("username", username),
            new Claim("role", role),
            new Claim(JwtRegisteredClaimNames.Sub, email ?? username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMilliseconds(_expirationMs),
            SigningCredentials = new SigningCredentials(GetSigningKey(), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public bool ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return false;

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = GetSigningKey(),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out _);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public ClaimsPrincipal? GetClaimsPrincipal(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            return tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = GetSigningKey(),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out _);
        }
        catch
        {
            return null;
        }
    }

    public int ExtractUserId(string token)
    {
        var principal = GetClaimsPrincipal(token);
        var claim = principal?.FindFirst("userId")?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    public string ExtractUsername(string token)
    {
        var principal = GetClaimsPrincipal(token);
        return principal?.FindFirst("username")?.Value ?? string.Empty;
    }

    public string ExtractRole(string token)
    {
        var principal = GetClaimsPrincipal(token);
        return principal?.FindFirst("role")?.Value
            ?? principal?.FindFirst(ClaimTypes.Role)?.Value
            ?? string.Empty;
    }

    public string ExtractSubject(string token)
    {
        var principal = GetClaimsPrincipal(token);
        return principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal?.FindFirst("sub")?.Value
            ?? string.Empty;
    }
}
