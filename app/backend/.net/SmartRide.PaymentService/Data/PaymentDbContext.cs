using Microsoft.EntityFrameworkCore;
using SmartRide.PaymentService.Models.Entities;

namespace SmartRide.PaymentService.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<PaymentAuditLog> PaymentAuditLogs { get; set; } = null!;
    public DbSet<Wallet> Wallets { get; set; } = null!;
    public DbSet<WalletTransaction> WalletTransactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(e => e.TransactionId).IsUnique();
            entity.Property(e => e.PaymentMode).HasConversion<string>();
            entity.Property(e => e.PaymentStatus).HasConversion<string>();
        });

        modelBuilder.Entity<PaymentAuditLog>(entity =>
        {
            entity.Property(e => e.StatusFrom).HasConversion<string>();
            entity.Property(e => e.StatusTo).HasConversion<string>();
        });

        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.HasIndex(e => e.UserId).IsUnique();
        });
    }
}
