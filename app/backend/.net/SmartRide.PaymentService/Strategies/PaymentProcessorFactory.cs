using SmartRide.PaymentService.Exceptions;
using SmartRide.PaymentService.Models.Enums;

namespace SmartRide.PaymentService.Strategies;

public class PaymentProcessorFactory
{
    private readonly IEnumerable<IPaymentProcessorStrategy> _strategies;

    public PaymentProcessorFactory(IEnumerable<IPaymentProcessorStrategy> strategies)
    {
        _strategies = strategies;
    }

    public IPaymentProcessorStrategy GetProcessor(PaymentMode mode)
    {
        var processor = _strategies.FirstOrDefault(s => s.Supports(mode));
        if (processor == null)
        {
            throw new PaymentException($"Unsupported payment mode: {mode}");
        }
        return processor;
    }
}
