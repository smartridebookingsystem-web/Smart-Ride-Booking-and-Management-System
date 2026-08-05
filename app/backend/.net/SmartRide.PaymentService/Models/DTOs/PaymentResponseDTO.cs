using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Models.DTOs;

public class PaymentResponseDTO
{
    public int PaymentId { get; set; }
    public string? TransactionId { get; set; }
    public int RideId { get; set; }
    public int? UserId { get; set; }
    public decimal TotalFare { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal NetAmount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? GatewayRef { get; set; }
    public string? FailureReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
