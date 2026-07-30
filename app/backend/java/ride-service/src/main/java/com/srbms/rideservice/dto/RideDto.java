package com.srbms.rideservice.dto;

public class RideDto {
    private Integer rideId;
    private Integer userId;
    private Integer vehicleId;
    private String source;
    private String destination;
    private Integer status;
    private Integer driverId;

    public RideDto() {}

    public RideDto(Integer rideId, Integer userId, Integer vehicleId, String source, String destination, Integer status, Integer driverId) {
        this.rideId = rideId;
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.source = source;
        this.destination = destination;
        this.status = status;
        this.driverId = driverId;
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

    public Integer getDriverId() {
        return driverId;
    }

    public void setDriverId(Integer driverId) {
        this.driverId = driverId;
    }
}
