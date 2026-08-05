using System.ComponentModel.DataAnnotations;

namespace SmartRide.PaymentService.Models.DTOs;

public class FareCalculationRequestDTO
{
    [Required(ErrorMessage = "Distance in km is required")]
    [Range(typeof(decimal), "0.1", "79228162514264337593543950335", ErrorMessage = "Distance must be greater than zero")]
    public decimal DistanceKm { get; set; }

    public int? VehicleTypeId { get; set; }
    public string? VehicleTypeName { get; set; }
    public decimal SurgeMultiplier { get; set; } = 1.0m;
}
