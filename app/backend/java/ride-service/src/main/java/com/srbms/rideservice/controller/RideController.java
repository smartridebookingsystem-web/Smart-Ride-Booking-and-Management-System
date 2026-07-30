package com.srbms.rideservice.controller;

import com.srbms.rideservice.dto.AssignDriverRequest;
import com.srbms.rideservice.dto.CreateRideRequest;
import com.srbms.rideservice.dto.RideDto;
import com.srbms.rideservice.dto.UpdateRideStatusRequest;
import com.srbms.rideservice.service.RideService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*")
public class RideController {

    private final RideService rideService;

    @Autowired
    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @GetMapping
    public ResponseEntity<List<RideDto>> getAllRides() {
        return ResponseEntity.ok(rideService.getAllRides());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideDto> getRideById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(rideService.getRideById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RideDto>> getRidesByUserId(@PathVariable("userId") Integer userId) {
        return ResponseEntity.ok(rideService.getRidesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<RideDto> createRide(@Valid @RequestBody CreateRideRequest request) {
        RideDto createdRide = rideService.createRide(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRide);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RideDto> updateRideStatus(
            @PathVariable("id") Integer id,
            @Valid @RequestBody UpdateRideStatusRequest request) {
        return ResponseEntity.ok(rideService.updateRideStatus(id, request.getStatus()));
    }

    @PostMapping("/{id}/assign-driver")
    public ResponseEntity<RideDto> assignDriver(
            @PathVariable("id") Integer id,
            @Valid @RequestBody AssignDriverRequest request) {
        return ResponseEntity.ok(rideService.assignDriver(id, request.getDriverId()));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RideDto>> getRidesByDriverId(@PathVariable("driverId") Integer driverId) {
        return ResponseEntity.ok(rideService.getRidesByDriverId(driverId));
    }
}
