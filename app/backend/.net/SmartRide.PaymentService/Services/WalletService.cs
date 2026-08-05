using Microsoft.EntityFrameworkCore;
using SmartRide.PaymentService.Data;
using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;

namespace SmartRide.PaymentService.Services;

public class WalletService : IWalletService
{
    private readonly PaymentDbContext _dbContext;

    public WalletService(PaymentDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Wallet> GetWalletByUserIdAsync(int userId)
    {
        var wallet = await _dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
        if (wallet == null)
        {
            wallet = new Wallet(userId, 0m);
            _dbContext.Wallets.Add(wallet);
            await _dbContext.SaveChangesAsync();
        }
        return wallet;
    }

    public async Task<Wallet> TopUpWalletAsync(WalletRequestDTO requestDTO)
    {
        var wallet = await GetWalletByUserIdAsync(requestDTO.UserId);
        wallet.Balance += requestDTO.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        _dbContext.Wallets.Update(wallet);

        string refId = "TOPUP_" + Guid.NewGuid().ToString("N")[..8].ToUpper();
        string desc = !string.IsNullOrWhiteSpace(requestDTO.Description) ? requestDTO.Description : "Wallet Top-up";

        var txn = new WalletTransaction(
            wallet.WalletId,
            "CREDIT",
            requestDTO.Amount,
            refId,
            desc
        );
        _dbContext.WalletTransactions.Add(txn);

        await _dbContext.SaveChangesAsync();
        return wallet;
    }

    public async Task<List<WalletTransaction>> GetWalletTransactionsAsync(int userId)
    {
        var wallet = await GetWalletByUserIdAsync(userId);
        return await _dbContext.WalletTransactions
            .Where(t => t.WalletId == wallet.WalletId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
}
