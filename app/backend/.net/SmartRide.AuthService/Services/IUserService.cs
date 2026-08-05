using SmartRide.AuthService.Models.DTOs;

namespace SmartRide.AuthService.Services;

public interface IUserService
{
    Task<UserProfileResponse> GetUserProfileAsync(int userId);
    Task<List<UserProfileResponse>> GetAllUsersAsync();
    Task<UserProfileResponse> UpdateUserStatusAsync(int userId, string status);
    Task<UserProfileResponse> UpdateUserAsync(int userId, IDictionary<string, object> updates);
    Task DeleteUserAsync(int userId);
}
