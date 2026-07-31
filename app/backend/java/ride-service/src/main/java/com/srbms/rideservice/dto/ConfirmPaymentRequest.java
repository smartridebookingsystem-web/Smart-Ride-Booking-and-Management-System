package com.srbms.rideservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConfirmPaymentRequest {

    @NotBlank(message = "Payment mode is required")
    private String paymentMode;

    @NotNull(message = "Amount is required")
    private Double amount;

    private String transactionId;

    public ConfirmPaymentRequest() {}

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}
