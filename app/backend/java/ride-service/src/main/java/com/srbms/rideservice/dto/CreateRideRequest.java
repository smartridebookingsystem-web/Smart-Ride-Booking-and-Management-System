package com.srbms.rideservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateRideRequest {

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;

    @NotBlank(message = "Source location is required")
    private String source;

    @NotBlank(message = "Destination location is required")
    private String destination;

    public CreateRideRequest() {}

    public CreateRideRequest(Integer userId, Integer vehicleId, String source, String destination) {
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.source = source;
        this.destination = destination;
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
}
