package com.srbms.paymentservice.controller;

import com.srbms.paymentservice.dto.*;
import com.srbms.paymentservice.entity.Wallet;
import com.srbms.paymentservice.entity.WalletTransaction;
import com.srbms.paymentservice.service.PaymentService;
import com.srbms.paymentservice.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final WalletService walletService;

    @Autowired
    public PaymentController(PaymentService paymentService, WalletService walletService) {
        this.paymentService = paymentService;
        this.walletService = walletService;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Payment Service is UP and running", "OK"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getAllPayments() {
        List<PaymentResponseDTO> response = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("All payments retrieved", response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getAllPaymentsAlias() {
        List<PaymentResponseDTO> response = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("All payments retrieved", response));
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> processPayment(@Valid @RequestBody PaymentRequestDTO requestDTO) {
        PaymentResponseDTO response = paymentService.processPayment(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment processed successfully", response));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(@PathVariable Integer paymentId) {
        PaymentResponseDTO response = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved", response));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentByTransactionId(@PathVariable String transactionId) {
        PaymentResponseDTO response = paymentService.getPaymentByTransactionId(transactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved", response));
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentByRideId(@PathVariable Integer rideId) {
        PaymentResponseDTO response = paymentService.getPaymentByRideId(rideId);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved", response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getPaymentsByUserId(@PathVariable Integer userId) {
        List<PaymentResponseDTO> response = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("User payment history retrieved", response));
    }

    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> refundPayment(@Valid @RequestBody RefundRequestDTO requestDTO) {
        PaymentResponseDTO response = paymentService.refundPayment(requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", response));
    }

    @PostMapping("/calculate-fare")
    public ResponseEntity<ApiResponse<FareCalculationResponseDTO>> calculateFare(@Valid @RequestBody FareCalculationRequestDTO requestDTO) {
        FareCalculationResponseDTO response = paymentService.calculateFare(requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Fare calculated successfully", response));
    }

    @GetMapping("/wallet/{userId}")
    public ResponseEntity<ApiResponse<Wallet>> getWalletByUserId(@PathVariable Integer userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Wallet balance retrieved", wallet));
    }

    @PostMapping("/wallet/add-funds")
    public ResponseEntity<ApiResponse<Wallet>> topUpWallet(@Valid @RequestBody WalletRequestDTO requestDTO) {
        Wallet wallet = walletService.topUpWallet(requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Wallet topped up successfully", wallet));
    }

    @GetMapping("/wallet/{userId}/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransaction>>> getWalletTransactions(@PathVariable Integer userId) {
        List<WalletTransaction> transactions = walletService.getWalletTransactions(userId);
        return ResponseEntity.ok(ApiResponse.success("Wallet transactions retrieved", transactions));
    }
}
