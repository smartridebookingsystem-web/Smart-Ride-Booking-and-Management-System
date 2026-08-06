package com.srbms.authservice.controller;

import com.srbms.authservice.entity.Complaint;
import com.srbms.authservice.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @GetMapping({"", "/", "/all"})
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Integer id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getComplaintsByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(complaintService.getComplaintsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody Complaint complaint) {
        Complaint savedComplaint = complaintService.createComplaint(complaint);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComplaint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String resolutionNotes = payload.get("resolutionNotes");
            Complaint updatedComplaint = complaintService.updateComplaintStatus(id, status, resolutionNotes);
            return ResponseEntity.ok(updatedComplaint);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Integer id) {
        try {
            complaintService.deleteComplaint(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Complaint deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
