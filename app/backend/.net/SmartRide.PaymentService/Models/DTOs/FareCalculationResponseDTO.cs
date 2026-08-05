namespace SmartRide.PaymentService.Models.DTOs;

public class FareCalculationResponseDTO
{
    public decimal DistanceKm { get; set; }
    public decimal BaseFare { get; set; }
    public decimal PerKmRate { get; set; }
    public decimal DistanceFare { get; set; }
    public decimal SurgeMultiplier { get; set; }
    public decimal TotalCalculatedFare { get; set; }
    public string VehicleTypeName { get; set; } = "STANDARD";
}
