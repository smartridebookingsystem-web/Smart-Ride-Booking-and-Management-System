using SmartRide.AuthService.Models.DTOs;
using SmartRide.AuthService.Models.Entities;

namespace SmartRide.AuthService.Services;

public interface IAuthService
{
    Task<JwtResponse> LoginAsync(LoginRequest loginRequest);
    Task<User> RegisterAsync(RegisterRequest registerRequest);
    IDictionary<string, object> ValidateToken(string token);
}
