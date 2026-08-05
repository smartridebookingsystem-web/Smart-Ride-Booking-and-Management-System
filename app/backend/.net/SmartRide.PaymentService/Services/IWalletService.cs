using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;

namespace SmartRide.PaymentService.Services;

public interface IWalletService
{
    Task<Wallet> GetWalletByUserIdAsync(int userId);
    Task<Wallet> TopUpWalletAsync(WalletRequestDTO requestDTO);
    Task<List<WalletTransaction>> GetWalletTransactionsAsync(int userId);
}
