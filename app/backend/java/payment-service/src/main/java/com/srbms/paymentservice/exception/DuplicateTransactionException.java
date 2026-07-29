package com.srbms.paymentservice.exception;

public class DuplicateTransactionException extends PaymentException {

    public DuplicateTransactionException(String message) {
        super(message);
    }
}
