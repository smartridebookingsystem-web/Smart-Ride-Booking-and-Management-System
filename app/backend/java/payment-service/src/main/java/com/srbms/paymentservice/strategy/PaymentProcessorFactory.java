package com.srbms.paymentservice.strategy;

import com.srbms.paymentservice.entity.PaymentMode;
import com.srbms.paymentservice.exception.PaymentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PaymentProcessorFactory {

    private final List<PaymentProcessorStrategy> strategies;

    @Autowired
    public PaymentProcessorFactory(List<PaymentProcessorStrategy> strategies) {
        this.strategies = strategies;
    }

    public PaymentProcessorStrategy getProcessor(PaymentMode mode) {
        return strategies.stream()
                .filter(strategy -> strategy.supports(mode))
                .findFirst()
                .orElseThrow(() -> new PaymentException("Unsupported payment mode: " + mode));
    }
}
