package com.srbms.admin.client;

import com.srbms.admin.dto.RideDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

/**
 * Declarative OpenFeign client for communicating with Ride Service microservice (ride-service).
 * Fetches ride booking metrics, statuses, and fare data.
 */
@FeignClient(name = "ride-service", url = "${services.ride-service.url:http://localhost:8080}")
public interface RideClient {

    /**
     * Fetches all ride records from ride-service.
     */
    @GetMapping("/api/rides")
    List<RideDto> getAllRides();
}
