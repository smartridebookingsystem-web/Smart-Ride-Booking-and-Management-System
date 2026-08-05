using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.PaymentService.Models.Entities;

[Table("wallet_transaction")]
public class WalletTransaction
{
    [Key]
    [Column("wallet_txn_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int WalletTxnId { get; set; }

    [Column("wallet_id")]
    public int WalletId { get; set; }

    [Column("txn_type")]
    [StringLength(20)]
    public string TxnType { get; set; } = "CREDIT"; // CREDIT, DEBIT

    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column("reference_id")]
    [StringLength(64)]
    public string? ReferenceId { get; set; }

    [Column("description")]
    [StringLength(255)]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public WalletTransaction() { }

    public WalletTransaction(int walletId, string txnType, decimal amount, string? referenceId, string? description)
    {
        WalletId = walletId;
        TxnType = txnType;
        Amount = amount;
        ReferenceId = referenceId;
        Description = description;
        CreatedAt = DateTime.UtcNow;
    }
}
