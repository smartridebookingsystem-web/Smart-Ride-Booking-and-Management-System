using Microsoft.AspNetCore.Mvc;
using SmartRide.AuthService.Models.DTOs;
using SmartRide.AuthService.Services;

namespace SmartRide.AuthService.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetMyProfile(
        [FromHeader(Name = "X-User-Id")] string? userIdHeader,
        [FromQuery(Name = "userId")] int? queryUserId)
    {
        int? targetUserId = null;
        if (!string.IsNullOrWhiteSpace(userIdHeader) && int.TryParse(userIdHeader, out var parsedHeaderId))
        {
            targetUserId = parsedHeaderId;
        }
        else if (queryUserId.HasValue)
        {
            targetUserId = queryUserId.Value;
        }

        if (!targetUserId.HasValue)
        {
            return BadRequest(new { error = "Missing User ID in header or query parameter" });
        }

        try
        {
            var profile = await _userService.GetUserProfileAsync(targetUserId.Value);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById([FromRoute] int id)
    {
        try
        {
            var profile = await _userService.GetUserProfileAsync(id);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<UserProfileResponse>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateUserStatus([FromRoute] int id, [FromBody] Dictionary<string, string> body)
    {
        try
        {
            if (!body.TryGetValue("status", out var status) || string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(new { error = "Status field is required" });
            }

            var updatedProfile = await _userService.UpdateUserStatusAsync(id, status);
            return Ok(updatedProfile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser([FromRoute] int id, [FromBody] Dictionary<string, object> body)
    {
        try
        {
            var updatedProfile = await _userService.UpdateUserAsync(id, body);
            return Ok(updatedProfile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser([FromRoute] int id)
    {
        try
        {
            await _userService.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully", userId = id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
