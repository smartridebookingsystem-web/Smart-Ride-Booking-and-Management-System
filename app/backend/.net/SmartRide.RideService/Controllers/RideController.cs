using Microsoft.AspNetCore.Mvc;
using SmartRide.RideService.Models.DTOs;
using SmartRide.RideService.Services;

namespace SmartRide.RideService.Controllers;

[ApiController]
[Route("api/rides")]
public class RideController : ControllerBase
{
    private readonly IRideService _rideService;

    public RideController(IRideService rideService)
    {
        _rideService = rideService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRides()
    {
        var rides = await _rideService.GetAllRidesAsync();
        return Ok(rides);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRideById(int id)
    {
        var ride = await _rideService.GetRideByIdAsync(id);
        return Ok(ride);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetRidesByUserId(int userId)
    {
        var rides = await _rideService.GetRidesByUserIdAsync(userId);
        return Ok(rides);
    }

    [HttpGet("driver/{driverId}")]
    public async Task<IActionResult> GetRidesByDriverId(int driverId)
    {
        var rides = await _rideService.GetRidesByDriverIdAsync(driverId);
        return Ok(rides);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRide([FromBody] CreateRideRequest request)
    {
        var created = await _rideService.CreateRideAsync(request);
        return CreatedAtAction(nameof(GetRideById), new { id = created.RideId }, created);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateRideStatus(int id, [FromBody] UpdateRideStatusRequest request)
    {
        var updated = await _rideService.UpdateRideStatusAsync(id, request.Status);
        return Ok(updated);
    }

    [HttpPut("{id}/accept")]
    public async Task<IActionResult> AcceptRide(int id, [FromBody] AssignDriverRequest request)
    {
        if (request.DriverId == null) return BadRequest("Driver ID is required");
        var updated = await _rideService.AcceptRideAsync(id, request.DriverId.Value);
        return Ok(updated);
    }

    [HttpPut("{id}/start")]
    public async Task<IActionResult> StartTrip(int id)
    {
        var updated = await _rideService.StartTripAsync(id);
        return Ok(updated);
    }

    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteTrip(int id)
    {
        var updated = await _rideService.CompleteTripAsync(id);
        return Ok(updated);
    }

    [HttpPost("{id}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(int id, [FromBody] ConfirmPaymentRequest request)
    {
        var updated = await _rideService.ConfirmPaymentAsync(id, request);
        return Ok(updated);
    }

    [HttpPost("{id}/assign-driver")]
    public async Task<IActionResult> AssignDriver(int id, [FromBody] AssignDriverRequest request)
    {
        if (request.DriverId == null) return BadRequest("Driver ID is required");
        var updated = await _rideService.AcceptRideAsync(id, request.DriverId.Value);
        return Ok(updated);
    }

    [HttpGet("{id}/otp")]
    public async Task<IActionResult> GetRideOtp(int id)
    {
        string otp = await _rideService.GetRideOtpFromDbAsync(id);
        return Ok(new { rideId = id.ToString(), otp });
    }
}
