using System.ComponentModel.DataAnnotations;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Models.DTOs;

public class PaymentRequestDTO
{
    [Required(ErrorMessage = "Ride ID is required")]
    public int RideId { get; set; }

    [Required(ErrorMessage = "User ID is required")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Total fare is required")]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335", ErrorMessage = "Total fare must be greater than zero")]
    public decimal TotalFare { get; set; }

    public decimal? DiscountAmount { get; set; }

    [Required(ErrorMessage = "Payment mode is required")]
    public PaymentMode PaymentMode { get; set; }

    public string? TransactionId { get; set; }
    public string? PaymentDetailsToken { get; set; }
}
