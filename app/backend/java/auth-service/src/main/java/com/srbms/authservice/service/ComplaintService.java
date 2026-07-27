package com.srbms.authservice.service;

import com.srbms.authservice.entity.Complaint;
import com.srbms.authservice.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Optional<Complaint> getComplaintById(Integer id) {
        return complaintRepository.findById(id);
    }

    public List<Complaint> getComplaintsByUserId(Integer userId) {
        return complaintRepository.findByUserId(userId);
    }

    public Complaint createComplaint(Complaint complaint) {
        if (complaint.getStatus() == null || complaint.getStatus().isEmpty()) {
            complaint.setStatus("Open");
        }
        return complaintRepository.save(complaint);
    }

    public Complaint updateComplaintStatus(Integer id, String status, String resolutionNotes) {
        Optional<Complaint> optionalComplaint = complaintRepository.findById(id);
        if (optionalComplaint.isPresent()) {
            Complaint complaint = optionalComplaint.get();
            if (status != null && !status.isEmpty()) {
                complaint.setStatus(status);
            }
            if (resolutionNotes != null) {
                complaint.setResolutionNotes(resolutionNotes);
            }
            return complaintRepository.save(complaint);
        }
        throw new RuntimeException("Complaint not found with ID: " + id);
    }

    public void deleteComplaint(Integer id) {
        complaintRepository.deleteById(id);
    }
}
