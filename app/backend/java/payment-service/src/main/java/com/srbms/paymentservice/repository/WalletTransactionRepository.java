package com.srbms.paymentservice.repository;

import com.srbms.paymentservice.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Integer walletId);
}
