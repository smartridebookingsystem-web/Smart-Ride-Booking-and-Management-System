package com.srbms.authservice.repository;

import com.srbms.authservice.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    List<Complaint> findByUserId(Integer userId);
    List<Complaint> findByStatus(String status);
}
