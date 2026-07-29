package com.srbms.paymentservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transaction")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_txn_id")
    private Integer walletTxnId;

    @Column(name = "wallet_id", nullable = false)
    private Integer walletId;

    @Column(name = "txn_type", nullable = false, length = 20)
    private String txnType; // CREDIT, DEBIT

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "reference_id", length = 64)
    private String referenceId;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public WalletTransaction() {}

    public WalletTransaction(Integer walletId, String txnType, BigDecimal amount, String referenceId, String description) {
        this.walletId = walletId;
        this.txnType = txnType;
        this.amount = amount;
        this.referenceId = referenceId;
        this.description = description;
    }

    public Integer getWalletTxnId() {
        return walletTxnId;
    }

    public void setWalletTxnId(Integer walletTxnId) {
        this.walletTxnId = walletTxnId;
    }

    public Integer getWalletId() {
        return walletId;
    }

    public void setWalletId(Integer walletId) {
        this.walletId = walletId;
    }

    public String getTxnType() {
        return txnType;
    }

    public void setTxnType(String txnType) {
        this.txnType = txnType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
