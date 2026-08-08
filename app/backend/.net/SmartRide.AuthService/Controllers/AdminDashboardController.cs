using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRide.AuthService.Data;

namespace SmartRide.AuthService.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly AuthDbContext _context;

    public AdminDashboardController(AuthDbContext context)
    {
        _context = context;
    }

    [HttpGet("driver-count")]
    public async Task<IActionResult> GetDriverCount()
    {
        long count = await _context.Drivers.LongCountAsync();
        return Ok(new { count });
    }
}
