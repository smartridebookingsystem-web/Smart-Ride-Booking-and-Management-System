using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SmartRide.ApiGateway.Services;

public class JwtUtil : IJwtUtil
{
    private readonly string _secret;

    public JwtUtil(IConfiguration configuration)
    {
        _secret = configuration["Jwt:Secret"]
            ?? "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    }

    private TokenValidationParameters GetValidationParameters()
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

        return new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    }

    public bool IsTokenValid(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return false;

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            tokenHandler.ValidateToken(token, GetValidationParameters(), out _);
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
            return tokenHandler.ValidateToken(token, GetValidationParameters(), out _);
        }
        catch
        {
            return null;
        }
    }
}
