package com.srbms.paymentservice.strategy;

import com.srbms.paymentservice.dto.PaymentRequestDTO;
import com.srbms.paymentservice.entity.Payment;
import com.srbms.paymentservice.entity.PaymentMode;

public interface PaymentProcessorStrategy {

    boolean supports(PaymentMode paymentMode);

    Payment process(Payment payment, PaymentRequestDTO requestDTO);

    Payment refund(Payment payment, java.math.BigDecimal amount, String reason);
}
