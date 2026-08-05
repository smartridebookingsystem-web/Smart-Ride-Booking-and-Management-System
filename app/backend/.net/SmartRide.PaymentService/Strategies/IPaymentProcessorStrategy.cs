using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Strategies;

public interface IPaymentProcessorStrategy
{
    bool Supports(PaymentMode paymentMode);
    Task<Payment> ProcessAsync(Payment payment, PaymentRequestDTO requestDTO);
    Task<Payment> RefundAsync(Payment payment, decimal? amount, string reason);
}
