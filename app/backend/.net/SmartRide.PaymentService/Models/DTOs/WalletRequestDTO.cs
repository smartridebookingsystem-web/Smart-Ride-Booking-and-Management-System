using System.ComponentModel.DataAnnotations;

namespace SmartRide.PaymentService.Models.DTOs;

public class WalletRequestDTO
{
    [Required(ErrorMessage = "User ID is required")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Amount is required")]
    [Range(typeof(decimal), "1.00", "79228162514264337593543950335", ErrorMessage = "Minimum top up amount is 1.00")]
    public decimal Amount { get; set; }

    public string? PaymentMethodToken { get; set; }
    public string? Description { get; set; }
}
