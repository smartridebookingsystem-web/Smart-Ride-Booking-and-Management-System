using Microsoft.AspNetCore.Mvc;
using SmartRide.PaymentService.Models.DTOs;
using SmartRide.PaymentService.Models.Entities;
using SmartRide.PaymentService.Services;

namespace SmartRide.PaymentService.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IWalletService _walletService;

    public PaymentController(IPaymentService paymentService, IWalletService walletService)
    {
        _paymentService = paymentService;
        _walletService = walletService;
    }

    [HttpGet("health")]
    public ActionResult<ApiResponse<string>> HealthCheck()
    {
        return Ok(ApiResponse<string>.SuccessResponse("Payment Service is UP and running", "OK"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PaymentResponseDTO>>>> GetAllPayments()
    {
        var response = await _paymentService.GetAllPaymentsAsync();
        return Ok(ApiResponse<List<PaymentResponseDTO>>.SuccessResponse("All payments retrieved", response));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<PaymentResponseDTO>>>> GetAllPaymentsAlias()
    {
        var response = await _paymentService.GetAllPaymentsAsync();
        return Ok(ApiResponse<List<PaymentResponseDTO>>.SuccessResponse("All payments retrieved", response));
    }

    [HttpPost("process")]
    public async Task<ActionResult<ApiResponse<PaymentResponseDTO>>> ProcessPayment([FromBody] PaymentRequestDTO requestDTO)
    {
        var response = await _paymentService.ProcessPaymentAsync(requestDTO);
        return StatusCode(201, ApiResponse<PaymentResponseDTO>.SuccessResponse("Payment processed successfully", response));
    }

    [HttpGet("{paymentId:int}")]
    public async Task<ActionResult<ApiResponse<PaymentResponseDTO>>> GetPaymentById(int paymentId)
    {
        var response = await _paymentService.GetPaymentByIdAsync(paymentId);
        return Ok(ApiResponse<PaymentResponseDTO>.SuccessResponse("Payment details retrieved", response));
    }

    [HttpGet("transaction/{transactionId}")]
    public async Task<ActionResult<ApiResponse<PaymentResponseDTO>>> GetPaymentByTransactionId(string transactionId)
    {
        var response = await _paymentService.GetPaymentByTransactionIdAsync(transactionId);
        return Ok(ApiResponse<PaymentResponseDTO>.SuccessResponse("Payment details retrieved", response));
    }

    [HttpGet("ride/{rideId:int}")]
    public async Task<ActionResult<ApiResponse<PaymentResponseDTO>>> GetPaymentByRideId(int rideId)
    {
        var response = await _paymentService.GetPaymentByRideIdAsync(rideId);
        return Ok(ApiResponse<PaymentResponseDTO>.SuccessResponse("Payment details retrieved", response));
    }

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<ApiResponse<List<PaymentResponseDTO>>>> GetPaymentsByUserId(int userId)
    {
        var response = await _paymentService.GetPaymentsByUserIdAsync(userId);
        return Ok(ApiResponse<List<PaymentResponseDTO>>.SuccessResponse("User payment history retrieved", response));
    }

    [HttpPost("refund")]
    public async Task<ActionResult<ApiResponse<PaymentResponseDTO>>> RefundPayment([FromBody] RefundRequestDTO requestDTO)
    {
        var response = await _paymentService.RefundPaymentAsync(requestDTO);
        return Ok(ApiResponse<PaymentResponseDTO>.SuccessResponse("Payment refunded successfully", response));
    }

    [HttpPost("calculate-fare")]
    public ActionResult<ApiResponse<FareCalculationResponseDTO>> CalculateFare([FromBody] FareCalculationRequestDTO requestDTO)
    {
        var response = _paymentService.CalculateFare(requestDTO);
        return Ok(ApiResponse<FareCalculationResponseDTO>.SuccessResponse("Fare calculated successfully", response));
    }

    [HttpGet("wallet/{userId:int}")]
    public async Task<ActionResult<ApiResponse<Wallet>>> GetWalletByUserId(int userId)
    {
        var wallet = await _walletService.GetWalletByUserIdAsync(userId);
        return Ok(ApiResponse<Wallet>.SuccessResponse("Wallet balance retrieved", wallet));
    }

    [HttpPost("wallet/add-funds")]
    public async Task<ActionResult<ApiResponse<Wallet>>> TopUpWallet([FromBody] WalletRequestDTO requestDTO)
    {
        var wallet = await _walletService.TopUpWalletAsync(requestDTO);
        return Ok(ApiResponse<Wallet>.SuccessResponse("Wallet topped up successfully", wallet));
    }

    [HttpGet("wallet/{userId:int}/transactions")]
    public async Task<ActionResult<ApiResponse<List<WalletTransaction>>>> GetWalletTransactions(int userId)
    {
        var transactions = await _walletService.GetWalletTransactionsAsync(userId);
        return Ok(ApiResponse<List<WalletTransaction>>.SuccessResponse("Wallet transactions retrieved", transactions));
    }
}
