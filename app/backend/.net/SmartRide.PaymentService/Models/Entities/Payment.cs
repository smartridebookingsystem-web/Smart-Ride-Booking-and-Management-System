using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Models.Entities;

[Table("payment")]
public class Payment
{
    [Key]
    [Column("payment_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int PaymentId { get; set; }

    [Column("transaction_id")]
    [StringLength(64)]
    public string? TransactionId { get; set; }

    [Column("ride_id")]
    public int RideId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("total_fare", TypeName = "decimal(10,2)")]
    public decimal TotalFare { get; set; }

    [Column("discount_amount", TypeName = "decimal(10,2)")]
    public decimal DiscountAmount { get; set; } = 0m;

    [Column("net_amount", TypeName = "decimal(10,2)")]
    public decimal NetAmount { get; set; } = 0m;

    [Column("payment_mode")]
    public PaymentMode PaymentMode { get; set; }

    [Column("payment_status")]
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.PENDING;

    [Column("gateway_ref")]
    [StringLength(100)]
    public string? GatewayRef { get; set; }

    [Column("failure_reason")]
    [StringLength(255)]
    public string? FailureReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
