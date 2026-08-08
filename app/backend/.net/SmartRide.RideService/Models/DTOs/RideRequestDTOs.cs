namespace SmartRide.RideService.Models.DTOs;

public class CreateRideRequest
{
    public int? UserId { get; set; }
    public int? VehicleId { get; set; }
    public string? Source { get; set; }
    public string? Destination { get; set; }
    public decimal? Fare { get; set; }
}

public class AssignDriverRequest
{
    public int? DriverId { get; set; }
}

public class UpdateRideStatusRequest
{
    public int Status { get; set; }
}

public class ConfirmPaymentRequest
{
    public int? RideId { get; set; }
    public decimal? Amount { get; set; }
    public string? PaymentMode { get; set; }
}
