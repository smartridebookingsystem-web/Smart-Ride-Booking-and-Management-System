using Microsoft.EntityFrameworkCore;
using SmartRide.PaymentService.Data;
using SmartRide.PaymentService.Exceptions;
using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Strategies;

public class WalletPaymentProcessor : IPaymentProcessorStrategy
{
    private readonly PaymentDbContext _dbContext;

    public WalletPaymentProcessor(PaymentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public bool Supports(PaymentMode paymentMode)
    {
        return paymentMode == PaymentMode.WALLET;
    }

    public async Task<Payment> ProcessAsync(Payment payment, PaymentRequestDTO requestDTO)
    {
        int userId = payment.UserId ?? 0;
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            wallet = new Wallet(userId, 0m);
            _dbContext.Wallets.Add(wallet);
            await _dbContext.SaveChangesAsync();
        }

        decimal amountToPay = payment.NetAmount;
        if (wallet.Balance < amountToPay)
        {
            payment.PaymentStatus = PaymentStatus.FAILED;
            payment.FailureReason = $"Insufficient wallet balance. Available: {wallet.Balance}, Required: {amountToPay}";
            throw new InsufficientFundsException(payment.FailureReason);
        }

        // Deduct balance
        wallet.Balance -= amountToPay;
        wallet.UpdatedAt = DateTime.UtcNow;

        // Record transaction
        string refId = "WLT_DEBIT_" + Guid.NewGuid().ToString("N")[..8].ToUpper();
        var walletTxn = new WalletTransaction(
            wallet.WalletId,
            "DEBIT",
            amountToPay,
            refId,
            $"Ride Payment for Ride #{payment.RideId}"
        );
        _dbContext.WalletTransactions.Add(walletTxn);

        await _dbContext.SaveChangesAsync();

        payment.PaymentMode = PaymentMode.WALLET;
        payment.GatewayRef = refId;
        payment.PaymentStatus = PaymentStatus.SUCCESS;
        return payment;
    }

    public async Task<Payment> RefundAsync(Payment payment, decimal? amount, string reason)
    {
        int userId = payment.UserId ?? 0;
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            wallet = new Wallet(userId, 0m);
            _dbContext.Wallets.Add(wallet);
            await _dbContext.SaveChangesAsync();
        }

        decimal refundAmt = amount ?? payment.NetAmount;
        wallet.Balance += refundAmt;
        wallet.UpdatedAt = DateTime.UtcNow;

        string refId = "WLT_CREDIT_" + Guid.NewGuid().ToString("N")[..8].ToUpper();
        var walletTxn = new WalletTransaction(
            wallet.WalletId,
            "CREDIT",
            refundAmt,
            refId,
            $"Refund for Ride #{payment.RideId}: {reason}"
        );
        _dbContext.WalletTransactions.Add(walletTxn);

        await _dbContext.SaveChangesAsync();

        payment.PaymentStatus = PaymentStatus.REFUNDED;
        payment.GatewayRef = refId;
        return payment;
    }
}
