package com.srbms.rideservice.repository;

import com.srbms.rideservice.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Integer> {

    Optional<OtpVerification> findTopByRideIdOrderByIdDesc(Integer rideId);

    Optional<OtpVerification> findTopByPhoneOrderByIdDesc(String phone);
}
