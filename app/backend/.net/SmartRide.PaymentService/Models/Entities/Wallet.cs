using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRide.PaymentService.Models.Entities;

[Table("rider_wallet")]
public class Wallet
{
    [Key]
    [Column("wallet_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int WalletId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("balance", TypeName = "decimal(10,2)")]
    public decimal Balance { get; set; } = 0m;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Wallet() { }

    public Wallet(int userId, decimal balance)
    {
        UserId = userId;
        Balance = balance;
        UpdatedAt = DateTime.UtcNow;
    }
}
