package com.srbms.rideservice.repository;

import com.srbms.rideservice.entity.DriverRide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRideRepository extends JpaRepository<DriverRide, Integer> {
    List<DriverRide> findByDriverId(Integer driverId);
    Optional<DriverRide> findByRideId(Integer rideId);
}
