package com.srbms.rideservice.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateRideStatusRequest {

    @NotNull(message = "Status is required")
    private Integer status;

    public UpdateRideStatusRequest() {}

    public UpdateRideStatusRequest(Integer status) {
        this.status = status;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
