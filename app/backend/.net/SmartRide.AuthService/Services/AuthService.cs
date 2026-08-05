using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;
using SmartRide.AuthService.Models.DTOs;
using SmartRide.AuthService.Models.Entities;

namespace SmartRide.AuthService.Services;

public class AuthService : IAuthService
{
    private readonly AuthDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(AuthDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<JwtResponse> LoginAsync(LoginRequest loginRequest)
    {
        string identifier = loginRequest.EmailOrUsername ?? string.Empty;
        if (string.IsNullOrWhiteSpace(identifier))
        {
            throw new InvalidOperationException("Mobile number or username is required.");
        }

        // Try searching by phone, then username, then email
        User? user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Phone == identifier);

        if (user == null)
        {
            user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == identifier);
        }

        if (user == null && identifier.Contains('@'))
        {
            user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == identifier);
        }

        if (user == null)
        {
            throw new InvalidOperationException("Invalid mobile number/username or password");
        }

        bool passwordMatches = false;
        try
        {
            passwordMatches = BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password);
        }
        catch
        {
            // Fallback for legacy plain text passwords in database
            passwordMatches = (loginRequest.Password == user.Password);
        }

        if (!passwordMatches && loginRequest.Password == user.Password)
        {
            passwordMatches = true;
        }

        if (!passwordMatches)
        {
            throw new InvalidOperationException("Invalid mobile number/username or password");
        }

        string roleName = user.Role != null ? user.Role.RoleValue : "rider";
        string token = _jwtService.GenerateToken(user.UserId, user.Username, user.Email, roleName);

        return new JwtResponse(token, user.UserId, user.Username, user.Email, user.Phone, roleName);
    }

    public async Task<User> RegisterAsync(RegisterRequest registerRequest)
    {
        string rawPhone = registerRequest.Phone ?? string.Empty;
        if (string.IsNullOrWhiteSpace(rawPhone))
        {
            throw new InvalidOperationException("Mobile number is required for registration!");
        }

        string phone = Regex.Replace(rawPhone, @"^\+91", "");
        phone = Regex.Replace(phone, @"[^0-9]", "");

        bool phoneExists = await _context.Users.AnyAsync(u => u.Phone == phone || u.Phone == "+91" + phone);
        if (phoneExists)
        {
            throw new InvalidOperationException($"Mobile number +91{phone} is already registered! Please use a different number or login.");
        }

        string username = registerRequest.Username ?? string.Empty;
        if (string.IsNullOrWhiteSpace(username))
        {
            username = phone;
        }
        else
        {
            username = username.Trim();
        }

        bool usernameExists = await _context.Users.AnyAsync(u => u.Username == username);
        if (usernameExists)
        {
            throw new InvalidOperationException($"Username '{username}' is already taken! Please choose a different username.");
        }

        string? email = registerRequest.Email;
        if (string.IsNullOrWhiteSpace(email))
        {
            email = null;
        }
        else
        {
            email = email.Trim();
        }

        if (email != null && await _context.Users.AnyAsync(u => u.Email == email))
        {
            throw new InvalidOperationException($"Email '{email}' is already registered! Please use a different email address.");
        }

        string requestedRole = registerRequest.Role != null ? registerRequest.Role.ToLower() : "rider";
        Role? role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleValue.ToLower() == requestedRole);
        if (role == null)
        {
            role = new Role(requestedRole);
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password ?? string.Empty);

        var user = new User
        {
            Username = username,
            Email = email,
            Password = hashedPassword,
            Phone = phone,
            Dob = registerRequest.Dob ?? new DateTime(1990, 1, 1),
            Gender = registerRequest.Gender,
            RoleId = role.RoleId,
            Role = role,
            Status = "active",
            ProfileImage = registerRequest.ProfileImage ?? "default.jpg"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if ("driver".Equals(requestedRole, StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(registerRequest.LicenseNo))
            {
                throw new InvalidOperationException("Driver license number is required for driver registration!");
            }

            var driver = new Driver(user, registerRequest.LicenseNo, "unverified", registerRequest.LicensePdfUrl);
            _context.Drivers.Add(driver);
            await _context.SaveChangesAsync();
        }

        return user;
    }

    public IDictionary<string, object> ValidateToken(string token)
    {
        if (!string.IsNullOrWhiteSpace(token) && token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring(7).Trim();
        }

        bool isValid = _jwtService.ValidateToken(token);
        if (!isValid)
        {
            return new Dictionary<string, object> { { "valid", false } };
        }

        return new Dictionary<string, object>
        {
            { "valid", true },
            { "userId", _jwtService.ExtractUserId(token) },
            { "email", _jwtService.ExtractSubject(token) },
            { "role", _jwtService.ExtractRole(token) },
            { "username", _jwtService.ExtractUsername(token) }
        };
    }
}
