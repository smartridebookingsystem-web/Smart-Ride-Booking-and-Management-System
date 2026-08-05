namespace SmartRide.AuthService.Models.DTOs;

public class JwtResponse
{
    public string Token { get; set; } = string.Empty;
    public string Type { get; set; } = "Bearer";
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;

    public JwtResponse(string token, int userId, string username, string? email, string? phone, string role)
    {
        Token = token;
        UserId = userId;
        Username = username;
        Email = email;
        Phone = phone;
        Role = role;
    }
}
