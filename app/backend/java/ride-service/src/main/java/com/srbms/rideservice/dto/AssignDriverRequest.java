package com.srbms.rideservice.dto;

import jakarta.validation.constraints.NotNull;

public class AssignDriverRequest {

    @NotNull(message = "Driver ID is required")
    private Integer driverId;

    public AssignDriverRequest() {}

    public AssignDriverRequest(Integer driverId) {
        this.driverId = driverId;
    }

    public Integer getDriverId() {
        return driverId;
    }

    public void setDriverId(Integer driverId) {
        this.driverId = driverId;
    }
}
