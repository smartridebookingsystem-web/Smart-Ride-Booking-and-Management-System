package com.srbms.paymentservice.service;

import com.srbms.paymentservice.dto.WalletRequestDTO;
import com.srbms.paymentservice.entity.Wallet;
import com.srbms.paymentservice.entity.WalletTransaction;
import com.srbms.paymentservice.repository.WalletRepository;
import com.srbms.paymentservice.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Autowired
    public WalletService(WalletRepository walletRepository,
                         WalletTransactionRepository walletTransactionRepository) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    public Wallet getWalletByUserId(Integer userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(new Wallet(userId, BigDecimal.ZERO)));
    }

    @Transactional
    public Wallet topUpWallet(WalletRequestDTO requestDTO) {
        Wallet wallet = getWalletByUserId(requestDTO.getUserId());
        BigDecimal currentBalance = wallet.getBalance() != null ? wallet.getBalance() : BigDecimal.ZERO;
        wallet.setBalance(currentBalance.add(requestDTO.getAmount()));

        wallet = walletRepository.save(wallet);

        String refId = "TOPUP_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String desc = requestDTO.getDescription() != null ? requestDTO.getDescription() : "Wallet Top-up";

        walletTransactionRepository.save(new WalletTransaction(
                wallet.getWalletId(),
                "CREDIT",
                requestDTO.getAmount(),
                refId,
                desc
        ));

        return wallet;
    }

    public List<WalletTransaction> getWalletTransactions(Integer userId) {
        Wallet wallet = getWalletByUserId(userId);
        return walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getWalletId());
    }
}
