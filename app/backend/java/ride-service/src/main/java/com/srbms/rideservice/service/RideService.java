package com.srbms.rideservice.service;

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
        // Status 2 represents 'inprogress' by default as per DB schema
        Ride ride = new Ride(
                request.getUserId(),
                request.getVehicleId(),
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
    public RideDto assignDriver(Integer rideId, Integer driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));

        Optional<DriverRide> existingAssignment = driverRideRepository.findByRideId(rideId);
        if (existingAssignment.isPresent()) {
            DriverRide dr = existingAssignment.get();
            dr.setDriverId(driverId);
            driverRideRepository.save(dr);
        } else {
            DriverRide driverRide = new DriverRide(rideId, driverId);
            driverRideRepository.save(driverRide);
        }

        return convertToDto(ride);
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
