package com.srbms.rideservice.repository;

import com.srbms.rideservice.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Integer> {
    List<Ride> findByUserId(Integer userId);
    List<Ride> findByStatus(Integer status);
}
