package com.srbms.rideservice.service;

import com.srbms.rideservice.dto.AssignDriverRequest;
import com.srbms.rideservice.dto.ConfirmPaymentRequest;
import com.srbms.rideservice.dto.CreateRideRequest;
import com.srbms.rideservice.dto.RideDto;
import com.srbms.rideservice.entity.DriverRide;
import com.srbms.rideservice.entity.Ride;
import com.srbms.rideservice.repository.DriverRideRepository;
import com.srbms.rideservice.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final DriverRideRepository driverRideRepository;

    @Autowired
    public RideService(RideRepository rideRepository, DriverRideRepository driverRideRepository) {
        this.rideRepository = rideRepository;
        this.driverRideRepository = driverRideRepository;
    }

    @jakarta.annotation.PostConstruct
    public void seedInitialDataIfEmpty() {
        if (rideRepository.count() == 0) {
            Ride r1 = new Ride(4, 1, "Sangli Bus Stand", "VPIMSR College", 1);
            Ride r2 = new Ride(3, 2, "Shivaji University", "Railway Station", 1);
            Ride r3 = new Ride(4, 1, "Market Yard", "Ganapati Temple", 2);

            r1 = rideRepository.save(r1);
            r2 = rideRepository.save(r2);
            r3 = rideRepository.save(r3);

            driverRideRepository.save(new DriverRide(r1.getRideId(), 2));
            driverRideRepository.save(new DriverRide(r2.getRideId(), 1));
            driverRideRepository.save(new DriverRide(r3.getRideId(), 2));
        }
    }

    public List<RideDto> getAllRides() {
        return rideRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RideDto getRideById(Integer rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));
        return convertToDto(ride);
    }

    public List<RideDto> getRidesByUserId(Integer userId) {
        return rideRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RideDto createRide(CreateRideRequest request) {
        // Status 2 represents 'inprogress' / pending request
        Ride ride = new Ride(
                request.getUserId(),
                request.getVehicleId() != null ? request.getVehicleId() : 1,
                request.getSource(),
                request.getDestination(),
                2
        );
        Ride savedRide = rideRepository.save(ride);
        return convertToDto(savedRide);
    }

    @Transactional
    public RideDto updateRideStatus(Integer rideId, Integer status) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));
        ride.setStatus(status);
        Ride updatedRide = rideRepository.save(ride);
        return convertToDto(updatedRide);
    }

    @Transactional
    public RideDto acceptRide(Integer rideId, Integer driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));

        ride.setStatus(3); // Status 3 represents Accepted
        Ride updatedRide = rideRepository.save(ride);

        Optional<DriverRide> existingAssignment = driverRideRepository.findByRideId(rideId);
        if (existingAssignment.isPresent()) {
            DriverRide dr = existingAssignment.get();
            dr.setDriverId(driverId);
            driverRideRepository.save(dr);
        } else {
            DriverRide driverRide = new DriverRide(rideId, driverId);
            driverRideRepository.save(driverRide);
        }

        return convertToDto(updatedRide);
    }

    @Transactional
    public RideDto startTrip(Integer rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));
        ride.setStatus(2); // Status 2 = In Progress
        Ride updatedRide = rideRepository.save(ride);
        return convertToDto(updatedRide);
    }

    @Transactional
    public RideDto completeTrip(Integer rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));
        ride.setStatus(1); // Status 1 = Completed
        Ride updatedRide = rideRepository.save(ride);
        return convertToDto(updatedRide);
    }

    @Transactional
    public RideDto confirmPayment(Integer rideId, ConfirmPaymentRequest request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));

        ride.setStatus(1); // Status 1 = Completed & Paid
        Ride updatedRide = rideRepository.save(ride);
        return convertToDto(updatedRide);
    }

    @Transactional
    public RideDto assignDriver(Integer rideId, Integer driverId) {
        return acceptRide(rideId, driverId);
    }

    public List<RideDto> getRidesByDriverId(Integer driverId) {
        List<DriverRide> driverRides = driverRideRepository.findByDriverId(driverId);
        List<Integer> rideIds = driverRides.stream()
                .map(DriverRide::getRideId)
                .collect(Collectors.toList());

        return rideRepository.findAllById(rideIds).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private RideDto convertToDto(Ride ride) {
        Integer driverId = driverRideRepository.findByRideId(ride.getRideId())
                .map(DriverRide::getDriverId)
                .orElse(null);

        return new RideDto(
                ride.getRideId(),
                ride.getUserId(),
                ride.getVehicleId(),
                ride.getSource(),
                ride.getDestination(),
                ride.getStatus(),
                driverId
        );
    }
}
