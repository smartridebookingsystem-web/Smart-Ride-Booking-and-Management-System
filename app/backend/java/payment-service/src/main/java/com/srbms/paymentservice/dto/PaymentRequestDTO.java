package com.srbms.paymentservice.dto;

import com.srbms.paymentservice.entity.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PaymentRequestDTO {

    @NotNull(message = "Ride ID is required")
    private Integer rideId;

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Total fare is required")
    @DecimalMin(value = "0.01", message = "Total fare must be greater than zero")
    private BigDecimal totalFare;

    private BigDecimal discountAmount;

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;

    private String transactionId;
    private String paymentDetailsToken; // Encrypted card/UPI details simulation

    public PaymentRequestDTO() {}

    public Integer getRideId() {
        return rideId;
    }

    public void setRideId(Integer rideId) {
        this.rideId = rideId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public BigDecimal getTotalFare() {
        return totalFare;
    }

    public void setTotalFare(BigDecimal totalFare) {
        this.totalFare = totalFare;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public PaymentMode getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(PaymentMode paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getPaymentDetailsToken() {
        return paymentDetailsToken;
    }

    public void setPaymentDetailsToken(String paymentDetailsToken) {
        this.paymentDetailsToken = paymentDetailsToken;
    }
}
