namespace SmartRide.AuthService.Models.DTOs;

public class LoginRequest
{
    public string? EmailOrUsername { get; set; }
    public string? Password { get; set; }
}
