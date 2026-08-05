using System.ComponentModel.DataAnnotations;

namespace SmartRide.PaymentService.Models.DTOs;

public class RefundRequestDTO
{
    [Required(ErrorMessage = "Payment ID is required")]
    public int PaymentId { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335", ErrorMessage = "Refund amount must be greater than zero")]
    public decimal? RefundAmount { get; set; }

    [Required(ErrorMessage = "Reason for refund is required")]
    public string Reason { get; set; } = string.Empty;
}
