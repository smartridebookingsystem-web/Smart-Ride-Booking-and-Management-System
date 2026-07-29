package com.srbms.paymentservice.exception;

public class InsufficientFundsException extends PaymentException {

    public InsufficientFundsException(String message) {
        super(message);
    }
}
