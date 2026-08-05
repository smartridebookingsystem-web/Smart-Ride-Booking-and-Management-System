package com.srbms.authservice.service;

import com.srbms.authservice.dto.JwtResponse;
import com.srbms.authservice.dto.LoginRequest;
import com.srbms.authservice.dto.RegisterRequest;
import com.srbms.authservice.entity.Driver;
import com.srbms.authservice.entity.Role;
import com.srbms.authservice.entity.User;
import com.srbms.authservice.repository.DriverRepository;
import com.srbms.authservice.repository.RoleRepository;
import com.srbms.authservice.repository.UserRepository;
import com.srbms.authservice.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public JwtResponse login(LoginRequest loginRequest) {
        String identifier = loginRequest.getEmailOrUsername();
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Mobile number or username is required.");
        }

        // Try searching by phone, then username, then email
        Optional<User> userOpt = userRepository.findByPhone(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(identifier);
        }
        if (userOpt.isEmpty() && identifier.contains("@")) {
            userOpt = userRepository.findByEmail(identifier);
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid mobile number/username or password");
        }

        User user = userOpt.get();

        // Support both hashed passwords and legacy plain text from dump
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())
                || loginRequest.getPassword().equals(user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid mobile number/username or password");
        }

        String userStatus = user.getStatus() != null ? user.getStatus().toLowerCase() : "active";
        if ("inactive".equals(userStatus) || "deactivated".equals(userStatus) || "disabled".equals(userStatus) || "suspended".equals(userStatus)) {
            throw new RuntimeException("Your account is currently Inactive. Please contact customer support to reactivate your account.");
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleValue() : "rider";
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getEmail(), roleName);

        return new JwtResponse(token, user.getUserId(), user.getUsername(), user.getEmail(), user.getPhone(), roleName);
    }

    @org.springframework.transaction.annotation.Transactional
    public User register(RegisterRequest registerRequest) {
        String rawPhone = registerRequest.getPhone();
        if (rawPhone == null || rawPhone.isBlank()) {
            throw new RuntimeException("Mobile number is required for registration!");
        }

        String phone = rawPhone.replaceAll("^\\+91", "").replaceAll("[^0-9]", "");
        if (userRepository.existsByPhone(phone) || userRepository.existsByPhone("+91" + phone)) {
            throw new RuntimeException("Mobile number +91" + phone + " is already registered! Please use a different number or login.");
        }

        // Username defaults to phone number if not explicitly set
        String username = registerRequest.getUsername();
        if (username == null || username.isBlank()) {
            username = phone;
        } else {
            username = username.trim();
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username '" + username + "' is already taken! Please choose a different username.");
        }

        // Handle optional email
        String email = registerRequest.getEmail();
        if (email != null && email.isBlank()) {
            email = null;
        } else if (email != null) {
            email = email.trim();
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email '" + email + "' is already registered! Please use a different email address.");
        }

        String requestedRole = registerRequest.getRole() != null ? registerRequest.getRole().toLowerCase() : "rider";
        Role role = roleRepository.findByRoleValue(requestedRole)
                .orElseGet(() -> roleRepository.save(new Role(requestedRole)));

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(phone);
        user.setDob(registerRequest.getDob());
        user.setGender(registerRequest.getGender());
        user.setRole(role);
        if ("driver".equalsIgnoreCase(requestedRole)) {
            user.setStatus("Pending Verification");
        } else {
            user.setStatus("active");
        }
        user.setProfileImage(registerRequest.getProfileImage() != null ? registerRequest.getProfileImage() : "default.jpg");

        User savedUser = userRepository.save(user);

        if ("driver".equalsIgnoreCase(requestedRole)) {
            if (registerRequest.getLicenseNo() == null || registerRequest.getLicenseNo().isBlank()) {
                throw new RuntimeException("Driver license number is required for driver registration!");
            }
            Driver driver = new Driver(savedUser, registerRequest.getLicenseNo(), "unverified", registerRequest.getLicensePdfUrl());
            driverRepository.save(driver);
        }

        return savedUser;
    }

    public Map<String, Object> validateToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        boolean isValid = jwtUtil.validateToken(token);
        if (!isValid) {
            return Map.of("valid", false);
        }

        return Map.of(
            "valid", true,
            "userId", jwtUtil.extractUserId(token),
            "email", jwtUtil.extractSubject(token),
            "role", jwtUtil.extractRole(token),
            "username", jwtUtil.extractUsername(token)
        );
    }
}
