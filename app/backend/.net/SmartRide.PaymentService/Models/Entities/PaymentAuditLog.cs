using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Models.Entities;

[Table("payment_audit_log")]
public class PaymentAuditLog
{
    [Key]
    [Column("log_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LogId { get; set; }

    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("status_from")]
    public PaymentStatus? StatusFrom { get; set; }

    [Column("status_to")]
    public PaymentStatus StatusTo { get; set; }

    [Column("remarks")]
    [StringLength(255)]
    public string? Remarks { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public PaymentAuditLog() { }

    public PaymentAuditLog(int paymentId, PaymentStatus? statusFrom, PaymentStatus statusTo, string? remarks)
    {
        PaymentId = paymentId;
        StatusFrom = statusFrom;
        StatusTo = statusTo;
        Remarks = remarks;
        CreatedAt = DateTime.UtcNow;
    }
}
