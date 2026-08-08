using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;
using SmartRide.AuthService.Models.DTOs;
using SmartRide.AuthService.Services;

namespace SmartRide.AuthService.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IOtpService _otpService;
    private readonly AuthDbContext _context;

    public AuthController(IAuthService authService, IOtpService otpService, AuthDbContext context)
    {
        _authService = authService;
        _otpService = otpService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        try
        {
            var jwtResponse = await _authService.LoginAsync(loginRequest);
            return Ok(jwtResponse);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
    {
        try
        {
            var registeredUser = await _authService.RegisterAsync(registerRequest);
            return Ok(new
            {
                message = "User registered successfully!",
                userId = registeredUser.UserId,
                email = registeredUser.Email ?? ""
            });
        }
        catch (Exception ex)
        {
            string errorMsg = !string.IsNullOrWhiteSpace(ex.Message) ? ex.Message : "Registration failed. Please check input.";
            return BadRequest(new { error = errorMsg });
        }
    }

    [HttpGet("validate")]
    public IActionResult ValidateToken([FromHeader(Name = "Authorization")] string? token)
    {
        var validationResult = _authService.ValidateToken(token ?? string.Empty);
        if ((bool)validationResult["valid"])
        {
            return Ok(validationResult);
        }
        else
        {
            return StatusCode(401, validationResult);
        }
    }

    [HttpGet("check-availability")]
    public async Task<IActionResult> CheckAvailability(
        [FromQuery] string? phone,
        [FromQuery] string? email,
        [FromQuery] string? username,
        [FromQuery] string? licenseNo)
    {
        bool phoneExists = false;
        if (!string.IsNullOrWhiteSpace(phone))
        {
            string cleanPhone = Regex.Replace(phone, @"^\+91", "");
            cleanPhone = Regex.Replace(cleanPhone, @"[^0-9]", "");
            phoneExists = await _context.Users.AnyAsync(u => u.Phone == cleanPhone || u.Phone == "+91" + cleanPhone);
        }

        bool emailExists = false;
        if (!string.IsNullOrWhiteSpace(email))
        {
            emailExists = await _context.Users.AnyAsync(u => u.Email == email.Trim());
        }

        bool usernameExists = false;
        if (!string.IsNullOrWhiteSpace(username))
        {
            usernameExists = await _context.Users.AnyAsync(u => u.Username == username.Trim());
        }

        bool licenseExists = false;
        if (!string.IsNullOrWhiteSpace(licenseNo))
        {
            licenseExists = await _context.Drivers.AnyAsync(d => d.LicenseNo == licenseNo.Trim());
        }

        return Ok(new
        {
            phoneExists,
            emailExists,
            usernameExists,
            licenseExists
        });
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] Dictionary<string, object> body)
    {
        try
        {
            string phone = body.TryGetValue("phone", out var pVal) ? pVal?.ToString() ?? "" : "";
            bool isTripOtp = body.ContainsKey("isTripOtp");

            if (string.IsNullOrWhiteSpace(phone))
            {
                return BadRequest(new { error = "Phone number is required." });
            }

            string cleanPhone = Regex.Replace(phone, @"^\+91", "");
            cleanPhone = Regex.Replace(cleanPhone, @"[^0-9]", "");

            if (!isTripOtp)
            {
                bool phoneExists = await _context.Users.AnyAsync(u => u.Phone == cleanPhone || u.Phone == "+91" + cleanPhone);
                if (phoneExists)
                {
                    return BadRequest(new { error = "This mobile number is already registered! Please use a different number or login." });
                }
            }

            await _otpService.SendOtpAsync(cleanPhone);
            return Ok(new
            {
                success = true,
                message = $"OTP sent successfully to +91{cleanPhone}"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("verify-otp")]
    public IActionResult VerifyOtp([FromBody] Dictionary<string, string> body)
    {
        try
        {
            string phone = body.TryGetValue("phone", out var pVal) ? pVal : "";
            string otp = body.TryGetValue("otp", out var oVal) ? oVal : "";

            if (string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(otp))
            {
                return BadRequest(new { error = "Phone and OTP are required." });
            }

            bool valid = _otpService.VerifyOtp(phone, otp);
            if (valid)
            {
                return Ok(new { success = true, message = "Mobile number verified successfully!" });
            }
            else
            {
                return BadRequest(new { success = false, error = "Incorrect OTP. Please check the SMS on your phone and try again." });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] Dictionary<string, string> body)
    {
        try
        {
            string phone = body.TryGetValue("phone", out var pVal) ? pVal : "";
            string newPassword = body.TryGetValue("password", out var passVal) ? passVal : "";
            if (string.IsNullOrWhiteSpace(newPassword))
            {
                newPassword = body.TryGetValue("newPassword", out var newPassVal) ? newPassVal : "";
            }

            await _authService.ResetPasswordAsync(phone, newPassword);
            return Ok(new { success = true, message = "Password updated successfully!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}
