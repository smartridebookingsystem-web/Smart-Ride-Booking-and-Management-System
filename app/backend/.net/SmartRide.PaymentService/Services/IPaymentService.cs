using SmartRide.PaymentService.Models.DTOs;

namespace SmartRide.PaymentService.Services;

public interface IPaymentService
{
    Task<PaymentResponseDTO> ProcessPaymentAsync(PaymentRequestDTO requestDTO);
    Task<PaymentResponseDTO> GetPaymentByIdAsync(int paymentId);
    Task<PaymentResponseDTO> GetPaymentByTransactionIdAsync(string transactionId);
    Task<PaymentResponseDTO> GetPaymentByRideIdAsync(int rideId);
    Task<List<PaymentResponseDTO>> GetPaymentsByUserIdAsync(int userId);
    Task<List<PaymentResponseDTO>> GetAllPaymentsAsync();
    Task<PaymentResponseDTO> RefundPaymentAsync(RefundRequestDTO requestDTO);
    FareCalculationResponseDTO CalculateFare(FareCalculationRequestDTO requestDTO);
}
