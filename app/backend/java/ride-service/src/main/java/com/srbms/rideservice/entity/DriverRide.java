package com.srbms.rideservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DriverRide() {
        this.createdAt = LocalDateTime.now();
    }

    public DriverRide(Integer rideId, Integer driverId) {
        this.rideId = rideId;
        this.driverId = driverId;
        this.createdAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
