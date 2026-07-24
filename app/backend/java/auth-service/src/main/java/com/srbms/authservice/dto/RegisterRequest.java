package com.srbms.authservice.dto;

import java.time.LocalDate;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String phone;
    private LocalDate dob;
    private String gender; // male, female, other
    private String role;   // rider, driver, admin
    private String profileImage;
    private String licenseNo; // mandatory if role is driver
    private String licensePdfUrl;

    public RegisterRequest() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getLicenseNo() {
        return licenseNo;
    }

    public void setLicenseNo(String licenseNo) {
        this.licenseNo = licenseNo;
    }

    public String getLicensePdfUrl() {
        return licensePdfUrl;
    }

    public void setLicensePdfUrl(String licensePdfUrl) {
        this.licensePdfUrl = licensePdfUrl;
    }
}
