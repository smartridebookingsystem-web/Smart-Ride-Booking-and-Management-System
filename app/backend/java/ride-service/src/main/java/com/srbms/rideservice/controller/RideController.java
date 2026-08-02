
package com.srbms.rideservice.controller;

import com.srbms.rideservice.dto.AssignDriverRequest;
import com.srbms.rideservice.dto.ConfirmPaymentRequest;
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

    /**
     * Get all rides.
     *
     * GET /api/rides
     */
    @GetMapping
    public ResponseEntity<List<RideDto>> getAllRides() {
        return ResponseEntity.ok(rideService.getAllRides());
    }

    /**
     * Get ride by ID.
     *
     * GET /api/rides/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<RideDto> getRideById(
            @PathVariable("id") Integer id) {

        return ResponseEntity.ok(
                rideService.getRideById(id)
        );
    }

    /**
     * Get rides created by a user.
     *
     * GET /api/rides/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RideDto>> getRidesByUserId(
            @PathVariable("userId") Integer userId) {

        return ResponseEntity.ok(
                rideService.getRidesByUserId(userId)
        );
    }

    /**
     * Get rides assigned to a driver.
     *
     * GET /api/rides/driver/{driverId}
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RideDto>> getRidesByDriverId(
            @PathVariable("driverId") Integer driverId) {

        return ResponseEntity.ok(
                rideService.getRidesByDriverId(driverId)
        );
    }

    /**
     * Create a new ride request.
     *
     * POST /api/rides
     *
     * Expected JSON:
     *
     * {
     *   "userId": 3,
     *   "vehicleId": 1,
     *   "source": "Kothrud, Pune",
     *   "destination": "Viman Nagar, Pune"
     * }
     */
    @PostMapping
    public ResponseEntity<RideDto> createRide(
            @Valid @RequestBody CreateRideRequest request) {

        RideDto createdRide = rideService.createRide(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRide);
    }

    /**
     * Update ride status.
     *
     * PUT /api/rides/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<RideDto> updateRideStatus(
            @PathVariable("id") Integer id,
            @Valid @RequestBody UpdateRideStatusRequest request) {

        return ResponseEntity.ok(
                rideService.updateRideStatus(
                        id,
                        request.getStatus()
                )
        );
    }

    /**
     * Driver accepts a ride.
     *
     * PUT /api/rides/{id}/accept
     *
     * JSON:
     * {
     *   "driverId": 5
     * }
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<RideDto> acceptRide(
            @PathVariable("id") Integer id,
            @Valid @RequestBody AssignDriverRequest request) {

        return ResponseEntity.ok(
                rideService.acceptRide(
                        id,
                        request.getDriverId()
                )
        );
    }

    /**
     * Start trip.
     *
     * PUT /api/rides/{id}/start
     */
    @PutMapping("/{id}/start")
    public ResponseEntity<RideDto> startTrip(
            @PathVariable("id") Integer id) {

        return ResponseEntity.ok(
                rideService.startTrip(id)
        );
    }

    /**
     * Complete trip.
     *
     * PUT /api/rides/{id}/complete
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<RideDto> completeTrip(
            @PathVariable("id") Integer id) {

        return ResponseEntity.ok(
                rideService.completeTrip(id)
        );
    }

    /**
     * Confirm payment.
     *
     * POST /api/rides/{id}/confirm-payment
     */
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<RideDto> confirmPayment(
            @PathVariable("id") Integer id,
            @Valid @RequestBody ConfirmPaymentRequest request) {

        return ResponseEntity.ok(
                rideService.confirmPayment(id, request)
        );
    }

    /**
     * Assign driver to a ride.
     *
     * POST /api/rides/{id}/assign-driver
     */
    @PostMapping("/{id}/assign-driver")
    public ResponseEntity<RideDto> assignDriver(
            @PathVariable("id") Integer id,
            @Valid @RequestBody AssignDriverRequest request) {

        return ResponseEntity.ok(
                rideService.assignDriver(
                        id,
                        request.getDriverId()
                )
        );
    }
}

