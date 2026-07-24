package com.srbms.authservice.repository;

import com.srbms.authservice.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    Optional<Driver> findByUser_UserId(Integer userId);
    Boolean existsByLicenseNo(String licenseNo);
}
