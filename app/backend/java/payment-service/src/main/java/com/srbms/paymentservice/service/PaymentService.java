package com.srbms.paymentservice.service;

import com.srbms.paymentservice.dto.*;
import com.srbms.paymentservice.entity.*;
import com.srbms.paymentservice.exception.DuplicateTransactionException;
import com.srbms.paymentservice.exception.PaymentException;
import com.srbms.paymentservice.exception.PaymentNotFoundException;
import com.srbms.paymentservice.repository.PaymentAuditLogRepository;
import com.srbms.paymentservice.repository.PaymentRepository;
import com.srbms.paymentservice.strategy.PaymentProcessorFactory;
import com.srbms.paymentservice.strategy.PaymentProcessorStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAuditLogRepository auditLogRepository;
    private final PaymentProcessorFactory processorFactory;

    @Value("${fare.default.base:50.00}")
    private BigDecimal defaultBaseFare = new BigDecimal("50.00");

    @Value("${fare.default.per-km:15.00}")
    private BigDecimal defaultPerKmRate = new BigDecimal("15.00");

    @Autowired
    public PaymentService(PaymentRepository paymentRepository,
                          PaymentAuditLogRepository auditLogRepository,
                          PaymentProcessorFactory processorFactory) {
        this.paymentRepository = paymentRepository;
        this.auditLogRepository = auditLogRepository;
        this.processorFactory = processorFactory;
    }

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO requestDTO) {
        // 1. Idempotency Check for Ride
        if (paymentRepository.existsByRideIdAndPaymentStatus(requestDTO.getRideId(), PaymentStatus.SUCCESS)) {
            throw new DuplicateTransactionException("Payment has already been completed for Ride #" + requestDTO.getRideId());
        }

        // 2. Prepare Transaction ID
        String txnId = requestDTO.getTransactionId();
        if (txnId == null || txnId.trim().isEmpty()) {
            txnId = "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } else if (paymentRepository.existsByTransactionId(txnId)) {
            throw new DuplicateTransactionException("Transaction ID already exists: " + txnId);
        }

        // 3. Construct Payment entity
        BigDecimal discount = requestDTO.getDiscountAmount() != null ? requestDTO.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal netAmount = requestDTO.getTotalFare().subtract(discount);
        if (netAmount.compareTo(BigDecimal.ZERO) < 0) {
            netAmount = BigDecimal.ZERO;
        }

        Payment payment = new Payment();
        payment.setTransactionId(txnId);
        payment.setRideId(requestDTO.getRideId());
        payment.setUserId(requestDTO.getUserId());
        payment.setTotalFare(requestDTO.getTotalFare());
        payment.setDiscountAmount(discount);
        payment.setNetAmount(netAmount);
        payment.setPaymentMode(requestDTO.getPaymentMode());
        payment.setPaymentStatus(PaymentStatus.PROCESSING);

        payment = paymentRepository.save(payment);

        // 4. Save initial Audit Log
        auditLogRepository.save(new PaymentAuditLog(
                payment.getPaymentId(),
                PaymentStatus.PENDING,
                PaymentStatus.PROCESSING,
                "Initiating " + requestDTO.getPaymentMode() + " payment"
        ));

        // 5. Select strategy & process payment
        PaymentProcessorStrategy processor = processorFactory.getProcessor(requestDTO.getPaymentMode());
        try {
            payment = processor.process(payment, requestDTO);
        } catch (Exception ex) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setFailureReason(ex.getMessage());
            paymentRepository.save(payment);

            auditLogRepository.save(new PaymentAuditLog(
                    payment.getPaymentId(),
                    PaymentStatus.PROCESSING,
                    PaymentStatus.FAILED,
                    "Payment failed: " + ex.getMessage()
            ));
            throw ex;
        }

        payment = paymentRepository.save(payment);

        // 6. Save final Audit Log
        auditLogRepository.save(new PaymentAuditLog(
                payment.getPaymentId(),
                PaymentStatus.PROCESSING,
                PaymentStatus.SUCCESS,
                "Payment successfully processed via " + requestDTO.getPaymentMode()
        ));

        return mapToDTO(payment);
    }

    public PaymentResponseDTO getPaymentById(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + paymentId));
        return mapToDTO(payment);
    }

    public PaymentResponseDTO getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with Transaction ID: " + transactionId));
        return mapToDTO(payment);
    }

    public PaymentResponseDTO getPaymentByRideId(Integer rideId) {
        Payment payment = paymentRepository.findByRideId(rideId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for Ride ID: " + rideId));
        return mapToDTO(payment);
    }

    public List<PaymentResponseDTO> getPaymentsByUserId(Integer userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponseDTO refundPayment(RefundRequestDTO requestDTO) {
        Payment payment = paymentRepository.findById(requestDTO.getPaymentId())
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + requestDTO.getPaymentId()));

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentException("Only successful payments can be refunded. Current status: " + payment.getPaymentStatus());
        }

        PaymentStatus previousStatus = payment.getPaymentStatus();
        PaymentProcessorStrategy processor = processorFactory.getProcessor(payment.getPaymentMode());

        payment = processor.refund(payment, requestDTO.getRefundAmount(), requestDTO.getReason());
        payment = paymentRepository.save(payment);

        auditLogRepository.save(new PaymentAuditLog(
                payment.getPaymentId(),
                previousStatus,
                PaymentStatus.REFUNDED,
                "Refund issued: " + requestDTO.getReason()
        ));

        return mapToDTO(payment);
    }

    public FareCalculationResponseDTO calculateFare(FareCalculationRequestDTO requestDTO) {
        BigDecimal distance = requestDTO.getDistanceKm();
        BigDecimal base = defaultBaseFare != null ? defaultBaseFare : new BigDecimal("50.00");
        BigDecimal perKm = defaultPerKmRate != null ? defaultPerKmRate : new BigDecimal("15.00");

        if (requestDTO.getVehicleTypeName() != null) {
            String type = requestDTO.getVehicleTypeName().toUpperCase();
            if (type.contains("SUV") || type.contains("PREMIUM")) {
                base = new BigDecimal("80.00");
                perKm = new BigDecimal("22.00");
            } else if (type.contains("BIKE") || type.contains("TWO_WHEELER")) {
                base = new BigDecimal("25.00");
                perKm = new BigDecimal("8.00");
            } else if (type.contains("AUTO")) {
                base = new BigDecimal("35.00");
                perKm = new BigDecimal("12.00");
            }
        }

        BigDecimal surge = requestDTO.getSurgeMultiplier() != null && requestDTO.getSurgeMultiplier().compareTo(BigDecimal.ZERO) > 0
                ? requestDTO.getSurgeMultiplier()
                : BigDecimal.ONE;

        BigDecimal distanceFare = distance.multiply(perKm);
        BigDecimal subtotal = base.add(distanceFare);
        BigDecimal totalFare = subtotal.multiply(surge).setScale(2, RoundingMode.HALF_UP);

        FareCalculationResponseDTO response = new FareCalculationResponseDTO();
        response.setDistanceKm(distance);
        response.setBaseFare(base);
        response.setPerKmRate(perKm);
        response.setDistanceFare(distanceFare.setScale(2, RoundingMode.HALF_UP));
        response.setSurgeMultiplier(surge);
        response.setTotalCalculatedFare(totalFare);
        response.setVehicleTypeName(requestDTO.getVehicleTypeName() != null ? requestDTO.getVehicleTypeName() : "STANDARD");

        return response;
    }

    private PaymentResponseDTO mapToDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setTransactionId(payment.getTransactionId());
        dto.setRideId(payment.getRideId());
        dto.setUserId(payment.getUserId());
        dto.setTotalFare(payment.getTotalFare());
        dto.setDiscountAmount(payment.getDiscountAmount());
        dto.setNetAmount(payment.getNetAmount());
        dto.setPaymentMode(payment.getPaymentMode());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setGatewayRef(payment.getGatewayRef());
        dto.setFailureReason(payment.getFailureReason());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }
}
