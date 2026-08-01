package com.srbms.adminservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class DriverClient {

    private static final Logger logger = LoggerFactory.getLogger(DriverClient.class);

    @Autowired
    private RestTemplate restTemplate;

    @Value("${driver.service.url:http://DRIVER-SERVICE}")
    private String driverServiceUrl;

    public long fetchDriverCount() {
        try {
            String url = driverServiceUrl + "/api/drivers/count";
            logger.info("Calling Driver Service endpoint: {}", url);
            
            // Assume Driver Service exposes GET /api/drivers/count returning either a number or Map/JSON
            Object response = restTemplate.getForObject(url, Object.class);
            if (response instanceof Number number) {
                return number.longValue();
            } else if (response instanceof Map<?, ?> map) {
                Object countObj = map.containsKey("count") ? map.get("count") : map.get("driverCount");
                if (countObj instanceof Number num) {
                    return num.longValue();
                }
            }
            logger.warn("Unexpected response format from Driver Service count endpoint: {}", response);
            return 0L;
        } catch (Exception e) {
            logger.error("Failed to fetch driver count from Driver Service at {}: {}", driverServiceUrl, e.getMessage());
            return 0L;
        }
    }
}
