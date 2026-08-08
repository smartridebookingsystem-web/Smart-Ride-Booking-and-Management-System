namespace SmartRide.RideService.Models.DTOs;

public class RideDto
{
    public int RideId { get; set; }
    public int UserId { get; set; }
    public int VehicleId { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public int Status { get; set; }
    public int? DriverId { get; set; }
    public string? CreatedAt { get; set; }
    public decimal? Fare { get; set; }

    public RideDto() { }

    public RideDto(int rideId, int userId, int vehicleId, string source, string destination, int status, int? driverId, string? createdAt, decimal? fare = null)
    {
        RideId = rideId;
        UserId = userId;
        VehicleId = vehicleId;
        Source = source;
        Destination = destination;
        Status = status;
        DriverId = driverId;
        CreatedAt = createdAt;
        Fare = fare;
    }
}
