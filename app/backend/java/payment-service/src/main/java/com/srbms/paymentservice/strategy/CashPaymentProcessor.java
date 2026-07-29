package com.srbms.paymentservice.strategy;

import com.srbms.paymentservice.dto.PaymentRequestDTO;
import com.srbms.paymentservice.entity.Payment;
import com.srbms.paymentservice.entity.PaymentMode;
import com.srbms.paymentservice.entity.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class CashPaymentProcessor implements PaymentProcessorStrategy {

    @Override
    public boolean supports(PaymentMode paymentMode) {
        return paymentMode == PaymentMode.CASH;
    }

    @Override
    public Payment process(Payment payment, PaymentRequestDTO requestDTO) {
        payment.setPaymentMode(PaymentMode.CASH);
        payment.setGatewayRef("CASH_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        return payment;
    }

    @Override
    public Payment refund(Payment payment, BigDecimal amount, String reason) {
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        payment.setGatewayRef("CASH_RFD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return payment;
    }
}
