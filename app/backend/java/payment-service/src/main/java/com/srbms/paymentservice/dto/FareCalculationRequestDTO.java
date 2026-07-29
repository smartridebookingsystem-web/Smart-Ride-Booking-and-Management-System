package com.srbms.paymentservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class FareCalculationRequestDTO {

    @NotNull(message = "Distance in km is required")
    @DecimalMin(value = "0.1", message = "Distance must be greater than zero")
    private BigDecimal distanceKm;

    private Integer vehicleTypeId;
    private String vehicleTypeName; // Sedan, SUV, Bike, Auto
    private BigDecimal surgeMultiplier = BigDecimal.ONE;

    public FareCalculationRequestDTO() {}

    public BigDecimal getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(BigDecimal distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getVehicleTypeId() {
        return vehicleTypeId;
    }

    public void setVehicleTypeId(Integer vehicleTypeId) {
        this.vehicleTypeId = vehicleTypeId;
    }

    public String getVehicleTypeName() {
        return vehicleTypeName;
    }

    public void setVehicleTypeName(String vehicleTypeName) {
        this.vehicleTypeName = vehicleTypeName;
    }

    public BigDecimal getSurgeMultiplier() {
        return surgeMultiplier;
    }

    public void setSurgeMultiplier(BigDecimal surgeMultiplier) {
        this.surgeMultiplier = surgeMultiplier;
    }
}
