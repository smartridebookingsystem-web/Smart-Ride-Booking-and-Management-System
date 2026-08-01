package com.srbms.adminservice.service;

import com.srbms.adminservice.client.DriverClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    @Autowired
    private DriverClient driverClient;

    public long getTotalDriverCount() {
        return driverClient.fetchDriverCount();
    }
}
