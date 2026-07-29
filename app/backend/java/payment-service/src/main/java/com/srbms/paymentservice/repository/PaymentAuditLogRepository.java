package com.srbms.paymentservice.repository;

import com.srbms.paymentservice.entity.PaymentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAuditLogRepository extends JpaRepository<PaymentAuditLog, Integer> {

    List<PaymentAuditLog> findByPaymentIdOrderByCreatedAtDesc(Integer paymentId);
}
