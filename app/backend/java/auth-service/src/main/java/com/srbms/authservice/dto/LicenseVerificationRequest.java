package com.srbms.authservice.dto;

public class LicenseVerificationRequest {
    private String licenseNo;
    private String licensePdfUrl;

    public LicenseVerificationRequest() {
    }

    public LicenseVerificationRequest(String licenseNo, String licensePdfUrl) {
        this.licenseNo = licenseNo;
        this.licensePdfUrl = licensePdfUrl;
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
