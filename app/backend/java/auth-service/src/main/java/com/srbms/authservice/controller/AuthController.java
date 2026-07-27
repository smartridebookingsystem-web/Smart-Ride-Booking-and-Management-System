package com.srbms.authservice.controller;

import com.srbms.authservice.dto.JwtResponse;
import com.srbms.authservice.dto.LoginRequest;
import com.srbms.authservice.dto.RegisterRequest;
import com.srbms.authservice.entity.User;
import com.srbms.authservice.repository.DriverRepository;
import com.srbms.authservice.repository.UserRepository;
import com.srbms.authservice.service.AuthService;
import com.srbms.authservice.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.login(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            User registeredUser = authService.register(registerRequest);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "User registered successfully!");
            response.put("userId", registeredUser.getUserId());
            response.put("email", registeredUser.getEmail() != null ? registeredUser.getEmail() : "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Registration failed. Please check input.";
            return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        Map<String, Object> validationResult = authService.validateToken(token);
        if ((Boolean) validationResult.get("valid")) {
            return ResponseEntity.ok(validationResult);
        } else {
            return ResponseEntity.status(401).body(validationResult);
        }
    }

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "licenseNo", required = false) String licenseNo) {

        boolean phoneExists = false;
        if (phone != null && !phone.isBlank()) {
            String cleanPhone = phone.replaceAll("^\\+91", "").replaceAll("[^0-9]", "");
            phoneExists = userRepository.existsByPhone(cleanPhone) || userRepository.existsByPhone("+91" + cleanPhone);
        }

        boolean emailExists = false;
        if (email != null && !email.isBlank()) {
            emailExists = userRepository.existsByEmail(email.trim());
        }

        boolean usernameExists = false;
        if (username != null && !username.isBlank()) {
            usernameExists = userRepository.existsByUsername(username.trim());
        }

        boolean licenseExists = false;
        if (licenseNo != null && !licenseNo.isBlank()) {
            licenseExists = driverRepository.existsByLicenseNo(licenseNo.trim());
        }

        return ResponseEntity.ok(Map.of(
            "phoneExists", phoneExists,
            "emailExists", emailExists,
            "usernameExists", usernameExists,
            "licenseExists", licenseExists
        ));
    }

    // ── Twilio OTP Endpoints ───────────────────────────────────────────────

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        try {
            String phone = body.get("phone");
            if (phone == null || phone.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required."));
            }

            String cleanPhone = phone.replaceAll("^\\+91", "").replaceAll("[^0-9]", "");
            if (userRepository.existsByPhone(cleanPhone) || userRepository.existsByPhone("+91" + cleanPhone)) {
                return ResponseEntity.badRequest().body(Map.of("error", "This mobile number is already registered! Please use a different number or login."));
            }

            otpService.sendOtp(cleanPhone);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent successfully to +91" + cleanPhone
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            String phone = body.get("phone");
            String otp = body.get("otp");
            if (phone == null || otp == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone and OTP are required."));
            }
            boolean valid = otpService.verifyOtp(phone, otp);
            if (valid) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Mobile number verified successfully!"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Incorrect OTP. Please check the SMS on your phone and try again."));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
