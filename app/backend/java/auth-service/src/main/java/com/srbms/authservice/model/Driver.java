package com.srbms.authservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "driver")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "driver_id")
    private Integer driverId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "license_no", nullable = false)
    private String licenseNo;

    @Column(name = "status")
    private String status = "unverified";

    @Column(name = "license_pdf_url", columnDefinition = "LONGTEXT")
    private String licensePdfUrl;

    public Driver() {}

    public Driver(User user, String licenseNo, String status) {
        this.user = user;
        this.licenseNo = licenseNo;
        this.status = status;
    }

    public Driver(User user, String licenseNo, String status, String licensePdfUrl) {
        this.user = user;
        this.licenseNo = licenseNo;
        this.status = status;
        this.licensePdfUrl = licensePdfUrl;
    }

    public Integer getDriverId() {
        return driverId;
    }

    public void setDriverId(Integer driverId) {
        this.driverId = driverId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getLicenseNo() {
        return licenseNo;
    }

    public void setLicenseNo(String licenseNo) {
        this.licenseNo = licenseNo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLicensePdfUrl() {
        return licensePdfUrl;
    }

    public void setLicensePdfUrl(String licensePdfUrl) {
        this.licensePdfUrl = licensePdfUrl;
    }
}
