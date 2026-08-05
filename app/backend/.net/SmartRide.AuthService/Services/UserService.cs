using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;
using SmartRide.AuthService.Models.DTOs;
using SmartRide.AuthService.Models.Entities;

namespace SmartRide.AuthService.Services;

public class UserService : IUserService
{
    private readonly AuthDbContext _context;

    public UserService(AuthDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileResponse> GetUserProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new InvalidOperationException($"User not found with ID: {userId}");

        return await MapToUserProfileResponseAsync(user);
    }

    public async Task<List<UserProfileResponse>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .ToListAsync();

        var result = new List<UserProfileResponse>();
        foreach (var user in users)
        {
            result.Add(await MapToUserProfileResponseAsync(user));
        }

        return result;
    }

    public async Task<UserProfileResponse> UpdateUserStatusAsync(int userId, string status)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new InvalidOperationException($"User not found with ID: {userId}");

        user.Status = status;
        await _context.SaveChangesAsync();

        if (user.Role != null && "driver".Equals(user.Role.RoleValue, StringComparison.OrdinalIgnoreCase))
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver != null)
            {
                driver.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        return await MapToUserProfileResponseAsync(user);
    }

    public async Task<UserProfileResponse> UpdateUserAsync(int userId, IDictionary<string, object> updates)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new InvalidOperationException($"User not found with ID: {userId}");

        if (updates.ContainsKey("name") && updates["name"] != null)
        {
            user.Username = updates["name"].ToString()!;
        }
        else if (updates.ContainsKey("username") && updates["username"] != null)
        {
            user.Username = updates["username"].ToString()!;
        }

        if (updates.ContainsKey("email") && updates["email"] != null)
        {
            user.Email = updates["email"].ToString();
        }

        if (updates.ContainsKey("phone") && updates["phone"] != null)
        {
            user.Phone = updates["phone"].ToString();
        }

        if (updates.ContainsKey("status") && updates["status"] != null)
        {
            user.Status = updates["status"].ToString()!;
        }

        await _context.SaveChangesAsync();

        if (user.Role != null && "driver".Equals(user.Role.RoleValue, StringComparison.OrdinalIgnoreCase))
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver != null)
            {
                if (updates.ContainsKey("status") && updates["status"] != null)
                {
                    driver.Status = updates["status"].ToString()!;
                }
                if (updates.ContainsKey("licenseNo") && updates["licenseNo"] != null)
                {
                    driver.LicenseNo = updates["licenseNo"].ToString()!;
                }
                await _context.SaveChangesAsync();
            }
        }

        return await MapToUserProfileResponseAsync(user);
    }

    public async Task DeleteUserAsync(int userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId)
            ?? throw new InvalidOperationException($"User not found with ID: {userId}");

        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
        if (driver != null)
        {
            _context.Drivers.Remove(driver);
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    private async Task<UserProfileResponse> MapToUserProfileResponseAsync(User user)
    {
        var response = new UserProfileResponse
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            Phone = user.Phone,
            Dob = user.Dob,
            Gender = user.Gender,
            Role = user.Role != null ? user.Role.RoleValue : "rider",
            Status = user.Status,
            ProfileImage = user.ProfileImage
        };

        if ("driver".Equals(response.Role, StringComparison.OrdinalIgnoreCase))
        {
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == user.UserId);
            if (driver != null)
            {
                response.LicenseNo = driver.LicenseNo;
                response.LicensePdfUrl = driver.LicensePdfUrl;
            }
        }

        return response;
    }
}
