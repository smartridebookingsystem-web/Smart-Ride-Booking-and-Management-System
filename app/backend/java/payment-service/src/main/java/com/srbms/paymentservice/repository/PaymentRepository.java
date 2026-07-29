package com.srbms.paymentservice.repository;

import com.srbms.paymentservice.entity.Payment;
import com.srbms.paymentservice.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByRideId(Integer rideId);

    List<Payment> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Payment> findByPaymentStatus(PaymentStatus paymentStatus);

    boolean existsByTransactionId(String transactionId);

    boolean existsByRideIdAndPaymentStatus(Integer rideId, PaymentStatus paymentStatus);
}
