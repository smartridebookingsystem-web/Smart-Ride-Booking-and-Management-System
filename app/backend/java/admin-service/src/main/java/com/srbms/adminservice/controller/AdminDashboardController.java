package com.srbms.adminservice.controller;

import com.srbms.adminservice.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping("/driver-count")
    public ResponseEntity<Map<String, Object>> getDriverCount() {
        long count = adminDashboardService.getTotalDriverCount();
        return ResponseEntity.ok(Map.of("count", count));
    }
}
