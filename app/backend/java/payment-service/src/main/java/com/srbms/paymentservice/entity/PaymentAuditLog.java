package com.srbms.paymentservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_audit_log")
public class PaymentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    @Column(name = "payment_id", nullable = false)
    private Integer paymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_from", length = 20)
    private PaymentStatus statusFrom;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_to", nullable = false, length = 20)
    private PaymentStatus statusTo;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public PaymentAuditLog() {}

    public PaymentAuditLog(Integer paymentId, PaymentStatus statusFrom, PaymentStatus statusTo, String remarks) {
        this.paymentId = paymentId;
        this.statusFrom = statusFrom;
        this.statusTo = statusTo;
        this.remarks = remarks;
    }

    public Integer getLogId() {
        return logId;
    }

    public void setLogId(Integer logId) {
        this.logId = logId;
    }

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public PaymentStatus getStatusFrom() {
        return statusFrom;
    }

    public void setStatusFrom(PaymentStatus statusFrom) {
        this.statusFrom = statusFrom;
    }

    public PaymentStatus getStatusTo() {
        return statusTo;
    }

    public void setStatusTo(PaymentStatus statusTo) {
        this.statusTo = statusTo;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
