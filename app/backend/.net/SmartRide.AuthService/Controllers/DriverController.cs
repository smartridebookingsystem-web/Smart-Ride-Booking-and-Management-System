using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;
using SmartRide.AuthService.Models.Entities;

namespace SmartRide.AuthService.Controllers;

[ApiController]
[Route("api/drivers")]
public class DriverController : ControllerBase
{
    private readonly AuthDbContext _context;

    public DriverController(AuthDbContext context)
    {
        _context = context;
    }

    [HttpGet("count")]
    public async Task<IActionResult> GetDriverCount()
    {
        long count = await _context.Drivers.LongCountAsync();
        return Ok(new { count, driverCount = count });
    }

    [HttpGet("{driverId}/availability")]
    public async Task<IActionResult> GetDriverAvailability([FromRoute] int driverId)
    {
        var driver = await _context.Drivers
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.DriverId == driverId || d.UserId == driverId);

        string status = driver?.Status ?? driver?.User?.Status ?? "verified";

        return Ok(new
        {
            driverId,
            status,
            isOnline = true,
            isAvailable = true
        });
    }

    [HttpPut("{driverId}/availability")]
    public async Task<IActionResult> UpdateDriverAvailability([FromRoute] int driverId, [FromBody] Dictionary<string, object> payload)
    {
        var driver = await _context.Drivers
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.DriverId == driverId || d.UserId == driverId);

        string status = driver?.Status ?? driver?.User?.Status ?? "verified";

        bool isOnline = true;
        if (payload.TryGetValue("isOnline", out var onlineVal) && bool.TryParse(onlineVal?.ToString(), out var parsedOnline))
        {
            isOnline = parsedOnline;
        }

        bool isAvailable = true;
        if (payload.TryGetValue("isAvailable", out var availVal) && bool.TryParse(availVal?.ToString(), out var parsedAvail))
        {
            isAvailable = parsedAvail;
        }

        return Ok(new
        {
            driverId,
            status,
            isOnline,
            isAvailable,
            updatedAt = DateTime.UtcNow
        });
    }
}
