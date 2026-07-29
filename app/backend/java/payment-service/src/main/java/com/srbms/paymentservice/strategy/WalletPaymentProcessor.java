package com.srbms.paymentservice.strategy;

import com.srbms.paymentservice.dto.PaymentRequestDTO;
import com.srbms.paymentservice.entity.*;
import com.srbms.paymentservice.exception.InsufficientFundsException;
import com.srbms.paymentservice.repository.WalletRepository;
import com.srbms.paymentservice.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class WalletPaymentProcessor implements PaymentProcessorStrategy {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Autowired
    public WalletPaymentProcessor(WalletRepository walletRepository,
                                  WalletTransactionRepository walletTransactionRepository) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @Override
    public boolean supports(PaymentMode paymentMode) {
        return paymentMode == PaymentMode.WALLET;
    }

    @Override
    public Payment process(Payment payment, PaymentRequestDTO requestDTO) {
        Integer userId = payment.getUserId();
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(new Wallet(userId, BigDecimal.ZERO)));

        BigDecimal amountToPay = payment.getNetAmount();
        if (wallet.getBalance().compareTo(amountToPay) < 0) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Insufficient wallet balance. Available: " + wallet.getBalance() + ", Required: " + amountToPay);
            throw new InsufficientFundsException(payment.getFailureReason());
        }

        // Deduct balance
        wallet.setBalance(wallet.getBalance().subtract(amountToPay));
        walletRepository.save(wallet);

        // Record transaction
        String refId = "WLT_DEBIT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        walletTransactionRepository.save(new WalletTransaction(
                wallet.getWalletId(),
                "DEBIT",
                amountToPay,
                refId,
                "Ride Payment for Ride #" + payment.getRideId()
        ));

        payment.setPaymentMode(PaymentMode.WALLET);
        payment.setGatewayRef(refId);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        return payment;
    }

    @Override
    public Payment refund(Payment payment, BigDecimal amount, String reason) {
        Integer userId = payment.getUserId();
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(new Wallet(userId, BigDecimal.ZERO)));

        BigDecimal refundAmt = amount != null ? amount : payment.getNetAmount();
        wallet.setBalance(wallet.getBalance().add(refundAmt));
        walletRepository.save(wallet);

        String refId = "WLT_CREDIT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        walletTransactionRepository.save(new WalletTransaction(
                wallet.getWalletId(),
                "CREDIT",
                refundAmt,
                refId,
                "Refund for Ride #" + payment.getRideId() + ": " + reason
        ));

        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        payment.setGatewayRef(refId);
        return payment;
    }
}
