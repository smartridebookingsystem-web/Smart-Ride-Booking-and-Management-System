package com.srbms.authservice.service;

import com.srbms.authservice.dto.UserProfileResponse;
import com.srbms.authservice.entity.Driver;
import com.srbms.authservice.entity.User;
import com.srbms.authservice.repository.DriverRepository;
import com.srbms.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    public UserProfileResponse getUserProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return mapToUserProfileResponse(user);
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public UserProfileResponse updateUserStatus(Integer userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setStatus(status);
        userRepository.save(user);

        if (user.getRole() != null && "driver".equalsIgnoreCase(user.getRole().getRoleValue())) {
            Optional<Driver> driverOpt = driverRepository.findByUser_UserId(userId);
            driverOpt.ifPresent(driver -> {
                driver.setStatus(status);
                driverRepository.save(driver);
            });
        }

        return mapToUserProfileResponse(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public UserProfileResponse updateUser(Integer userId, Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (updates.containsKey("name") && updates.get("name") != null) {
            user.setUsername(String.valueOf(updates.get("name")));
        } else if (updates.containsKey("username") && updates.get("username") != null) {
            user.setUsername(String.valueOf(updates.get("username")));
        }

        if (updates.containsKey("email") && updates.get("email") != null) {
            user.setEmail(String.valueOf(updates.get("email")));
        }

        if (updates.containsKey("phone") && updates.get("phone") != null) {
            user.setPhone(String.valueOf(updates.get("phone")));
        }

        if (updates.containsKey("status") && updates.get("status") != null) {
            user.setStatus(String.valueOf(updates.get("status")));
        }

        userRepository.save(user);

        if (user.getRole() != null && "driver".equalsIgnoreCase(user.getRole().getRoleValue())) {
            Optional<Driver> driverOpt = driverRepository.findByUser_UserId(userId);
            driverOpt.ifPresent(driver -> {
                if (updates.containsKey("status") && updates.get("status") != null) {
                    driver.setStatus(String.valueOf(updates.get("status")));
                }
                if (updates.containsKey("licenseNo") && updates.get("licenseNo") != null) {
                    driver.setLicenseNo(String.valueOf(updates.get("licenseNo")));
                }
                driverRepository.save(driver);
            });
        }

        return mapToUserProfileResponse(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Optional<Driver> driverOpt = driverRepository.findByUser_UserId(userId);
        driverOpt.ifPresent(driver -> driverRepository.delete(driver));

        userRepository.delete(user);
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setDob(user.getDob());
        response.setGender(user.getGender());
        response.setRole(user.getRole() != null ? user.getRole().getRoleValue() : "rider");
        response.setStatus(user.getStatus());
        response.setProfileImage(user.getProfileImage());

        if ("driver".equalsIgnoreCase(response.getRole())) {
            Optional<Driver> driverOpt = driverRepository.findByUser_UserId(user.getUserId());
            driverOpt.ifPresent(driver -> {
                response.setLicenseNo(driver.getLicenseNo());
                response.setLicensePdfUrl(driver.getLicensePdfUrl());
            });
        }

        return response;
    }
}
