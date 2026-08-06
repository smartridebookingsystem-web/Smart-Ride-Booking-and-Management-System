package com.srbms.rideservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ride")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ride_id")
    private Integer rideId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "destination", nullable = false)
    private String destination;

    @Column(name = "status")
    private Integer status; // 1 = completed, 2 = inprogress, 0 = requested, 3 = accepted

    @Column(name = "fare")
    private Double fare;

    @Column(name = "created_at", insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    public Ride() {}

    public Ride(Integer userId, Integer vehicleId, String source, String destination, Integer status) {
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.source = source;
        this.destination = destination;
        this.status = status;
    }

    public Ride(Integer userId, Integer vehicleId, String source, String destination, Integer status, Double fare) {
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.source = source;
        this.destination = destination;
        this.status = status;
        this.fare = fare;
    }

    public Integer getRideId() {
        return rideId;
    }

    public void setRideId(Integer rideId) {
        this.rideId = rideId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Integer vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getFare() {
        return fare;
    }

    public void setFare(Double fare) {
        this.fare = fare;
    }
}
