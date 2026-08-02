
package com.srbms.rideservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "driver_ride")
public class DriverRide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "driver_ride_id")
    private Integer driverRideId;

    @Column(name = "ride_id", nullable = false)
    private Integer rideId;

    @Column(name = "driver_id", nullable = false)
    private Integer driverId;

    public DriverRide() {
    }

    public DriverRide(Integer rideId, Integer driverId) {
        this.rideId = rideId;
        this.driverId = driverId;
    }

    public Integer getDriverRideId() {
        return driverRideId;
    }

    public void setDriverRideId(Integer driverRideId) {
        this.driverRideId = driverRideId;
    }

    public Integer getRideId() {
        return rideId;
    }

    public void setRideId(Integer rideId) {
        this.rideId = rideId;
    }

    public Integer getDriverId() {
        return driverId;
    }

    public void setDriverId(Integer driverId) {
        this.driverId = driverId;
    }
}

