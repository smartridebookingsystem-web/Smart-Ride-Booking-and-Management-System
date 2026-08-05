using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Strategies;

public class CardPaymentProcessor : IPaymentProcessorStrategy
{
    public bool Supports(PaymentMode paymentMode)
    {
        return paymentMode == PaymentMode.CARD;
    }

    public Task<Payment> ProcessAsync(Payment payment, PaymentRequestDTO requestDTO)
    {
        payment.PaymentMode = PaymentMode.CARD;
        payment.GatewayRef = "CARD_GW_" + Guid.NewGuid().ToString("N")[..8].ToUpper();
        payment.PaymentStatus = PaymentStatus.SUCCESS;
        return Task.FromResult(payment);
    }

    public Task<Payment> RefundAsync(Payment payment, decimal? amount, string reason)
    {
        payment.PaymentStatus = PaymentStatus.REFUNDED;
        payment.GatewayRef = "CARD_RFD_" + Guid.NewGuid().ToString("N")[..8].ToUpper();
        return Task.FromResult(payment);
    }
}
