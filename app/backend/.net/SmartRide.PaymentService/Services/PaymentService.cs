using Microsoft.EntityFrameworkCore;
using SmartRide.PaymentService.Data;
using SmartRide.PaymentService.Exceptions;
using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;
using SmartRide.PaymentService.Models.Enums;
using SmartRide.PaymentService.Strategies;

namespace SmartRide.PaymentService.Services;

public class PaymentService : IPaymentService
{
    private readonly PaymentDbContext _dbContext;
    private readonly PaymentProcessorFactory _processorFactory;
    private readonly decimal _defaultBaseFare;
    private readonly decimal _defaultPerKmRate;

    public PaymentService(
        PaymentDbContext dbContext,
        PaymentProcessorFactory processorFactory,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _processorFactory = processorFactory;
        _defaultBaseFare = configuration.GetValue<decimal>("Fare:DefaultBase", 50.00m);
        _defaultPerKmRate = configuration.GetValue<decimal>("Fare:DefaultPerKm", 15.00m);
    }

    public async Task<PaymentResponseDTO> ProcessPaymentAsync(PaymentRequestDTO requestDTO)
    {
        // 1. Idempotency Check for Ride
        bool hasSuccessfulPayment = await _dbContext.Payments
            .AnyAsync(p => p.RideId == requestDTO.RideId && p.PaymentStatus == PaymentStatus.SUCCESS);
        if (hasSuccessfulPayment)
        {
            throw new DuplicateTransactionException($"Payment has already been completed for Ride #{requestDTO.RideId}");
        }

        // 2. Prepare Transaction ID
        string? txnId = requestDTO.TransactionId;
        if (string.IsNullOrWhiteSpace(txnId))
        {
            txnId = "TXN_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + "_" + Guid.NewGuid().ToString("N")[..6].ToUpper();
        }
        else
        {
            bool txnExists = await _dbContext.Payments.AnyAsync(p => p.TransactionId == txnId);
            if (txnExists)
            {
                throw new DuplicateTransactionException($"Transaction ID already exists: {txnId}");
            }
        }

        // 3. Construct Payment entity
        decimal discount = requestDTO.DiscountAmount ?? 0m;
        decimal netAmount = requestDTO.TotalFare - discount;
        if (netAmount < 0m)
        {
            netAmount = 0m;
        }

        var payment = new Payment
        {
            TransactionId = txnId,
            RideId = requestDTO.RideId,
            UserId = requestDTO.UserId,
            TotalFare = requestDTO.TotalFare,
            DiscountAmount = discount,
            NetAmount = netAmount,
            PaymentMode = requestDTO.PaymentMode,
            PaymentStatus = PaymentStatus.PROCESSING,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Payments.Add(payment);
        await _dbContext.SaveChangesAsync();

        // 4. Save initial Audit Log
        _dbContext.PaymentAuditLogs.Add(new PaymentAuditLog(
            payment.PaymentId,
            PaymentStatus.PENDING,
            PaymentStatus.PROCESSING,
            $"Initiating {requestDTO.PaymentMode} payment"
        ));
        await _dbContext.SaveChangesAsync();

        // 5. Select strategy & process payment
        var processor = _processorFactory.GetProcessor(requestDTO.PaymentMode);
        try
        {
            payment = await processor.ProcessAsync(payment, requestDTO);
        }
        catch (Exception ex)
        {
            payment.PaymentStatus = PaymentStatus.FAILED;
            payment.FailureReason = ex.Message;
            payment.UpdatedAt = DateTime.UtcNow;
            _dbContext.Payments.Update(payment);

            _dbContext.PaymentAuditLogs.Add(new PaymentAuditLog(
                payment.PaymentId,
                PaymentStatus.PROCESSING,
                PaymentStatus.FAILED,
                $"Payment failed: {ex.Message}"
            ));
            await _dbContext.SaveChangesAsync();
            throw;
        }

        payment.UpdatedAt = DateTime.UtcNow;
        _dbContext.Payments.Update(payment);

        // 6. Save final Audit Log
        _dbContext.PaymentAuditLogs.Add(new PaymentAuditLog(
            payment.PaymentId,
            PaymentStatus.PROCESSING,
            PaymentStatus.SUCCESS,
            $"Payment successfully processed via {requestDTO.PaymentMode}"
        ));
        await _dbContext.SaveChangesAsync();

        return MapToDTO(payment);
    }

    public async Task<PaymentResponseDTO> GetPaymentByIdAsync(int paymentId)
    {
        var payment = await _dbContext.Payments.FindAsync(paymentId)
            ?? throw new PaymentNotFoundException($"Payment not found with ID: {paymentId}");
        return MapToDTO(payment);
    }

    public async Task<PaymentResponseDTO> GetPaymentByTransactionIdAsync(string transactionId)
    {
        var payment = await _dbContext.Payments.FirstOrDefaultAsync(p => p.TransactionId == transactionId)
            ?? throw new PaymentNotFoundException($"Payment not found with Transaction ID: {transactionId}");
        return MapToDTO(payment);
    }

    public async Task<PaymentResponseDTO> GetPaymentByRideIdAsync(int rideId)
    {
        var payment = await _dbContext.Payments.FirstOrDefaultAsync(p => p.RideId == rideId)
            ?? throw new PaymentNotFoundException($"Payment not found for Ride ID: {rideId}");
        return MapToDTO(payment);
    }

    public async Task<List<PaymentResponseDTO>> GetPaymentsByUserIdAsync(int userId)
    {
        var payments = await _dbContext.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return payments.Select(MapToDTO).ToList();
    }

    public async Task<List<PaymentResponseDTO>> GetAllPaymentsAsync()
    {
        var payments = await _dbContext.Payments.ToListAsync();
        return payments.Select(MapToDTO).ToList();
    }

    public async Task<PaymentResponseDTO> RefundPaymentAsync(RefundRequestDTO requestDTO)
    {
        var payment = await _dbContext.Payments.FindAsync(requestDTO.PaymentId)
            ?? throw new PaymentNotFoundException($"Payment not found with ID: {requestDTO.PaymentId}");

        if (payment.PaymentStatus != PaymentStatus.SUCCESS)
        {
            throw new PaymentException($"Only successful payments can be refunded. Current status: {payment.PaymentStatus}");
        }

        var previousStatus = payment.PaymentStatus;
        var processor = _processorFactory.GetProcessor(payment.PaymentMode);

        payment = await processor.RefundAsync(payment, requestDTO.RefundAmount, requestDTO.Reason);
        payment.UpdatedAt = DateTime.UtcNow;
        _dbContext.Payments.Update(payment);

        _dbContext.PaymentAuditLogs.Add(new PaymentAuditLog(
            payment.PaymentId,
            previousStatus,
            PaymentStatus.REFUNDED,
            $"Refund issued: {requestDTO.Reason}"
        ));
        await _dbContext.SaveChangesAsync();

        return MapToDTO(payment);
    }

    public FareCalculationResponseDTO CalculateFare(FareCalculationRequestDTO requestDTO)
    {
        decimal distance = requestDTO.DistanceKm;
        decimal baseFare = _defaultBaseFare;
        decimal perKm = _defaultPerKmRate;

        if (!string.IsNullOrWhiteSpace(requestDTO.VehicleTypeName))
        {
            string type = requestDTO.VehicleTypeName.ToUpperInvariant();
            if (type.Contains("SUV") || type.Contains("PREMIUM"))
            {
                baseFare = 80.00m;
                perKm = 22.00m;
            }
            else if (type.Contains("BIKE") || type.Contains("TWO_WHEELER"))
            {
                baseFare = 25.00m;
                perKm = 8.00m;
            }
            else if (type.Contains("AUTO"))
            {
                baseFare = 35.00m;
                perKm = 12.00m;
            }
        }

        decimal surge = requestDTO.SurgeMultiplier > 0m ? requestDTO.SurgeMultiplier : 1.0m;
        decimal distanceFare = Math.Round(distance * perKm, 2, MidpointRounding.AwayFromZero);
        decimal subtotal = baseFare + distanceFare;
        decimal totalFare = Math.Round(subtotal * surge, 2, MidpointRounding.AwayFromZero);

        return new FareCalculationResponseDTO
        {
            DistanceKm = distance,
            BaseFare = baseFare,
            PerKmRate = perKm,
            DistanceFare = distanceFare,
            SurgeMultiplier = surge,
            TotalCalculatedFare = totalFare,
            VehicleTypeName = !string.IsNullOrWhiteSpace(requestDTO.VehicleTypeName) ? requestDTO.VehicleTypeName : "STANDARD"
        };
    }

    private static PaymentResponseDTO MapToDTO(Payment payment)
    {
        return new PaymentResponseDTO
        {
            PaymentId = payment.PaymentId,
            TransactionId = payment.TransactionId,
            RideId = payment.RideId,
            UserId = payment.UserId,
            TotalFare = payment.TotalFare,
            DiscountAmount = payment.DiscountAmount,
            NetAmount = payment.NetAmount,
            PaymentMode = payment.PaymentMode,
            PaymentStatus = payment.PaymentStatus,
            GatewayRef = payment.GatewayRef,
            FailureReason = payment.FailureReason,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };
    }
}
