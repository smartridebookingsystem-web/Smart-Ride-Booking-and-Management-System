
package com.srbms.rideservice.repository;

import com.srbms.rideservice.entity.DriverRide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRideRepository
        extends JpaRepository<DriverRide, Integer> {

    /*
     * Find driver assignment for a particular ride.
     *
     * Used when:
     * - Accepting a ride
     * - Converting Ride -> RideDto
     */
    Optional<DriverRide> findByRideId(Integer rideId);


    /*
     * Find all rides assigned to a particular driver.
     *
     * Used by:
     * GET /api/rides/driver/{driverId}
     */
    List<DriverRide> findByDriverId(Integer driverId);
}

