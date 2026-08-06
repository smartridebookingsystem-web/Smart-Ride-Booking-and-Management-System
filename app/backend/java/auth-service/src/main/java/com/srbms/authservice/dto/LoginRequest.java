package com.srbms.authservice.dto;

public class LoginRequest {
    private String emailOrUsername;
    private String phone;
    private String password;

    public LoginRequest() {}

    public String getEmailOrUsername() {
        return emailOrUsername != null ? emailOrUsername : phone;
    }

    public void setEmailOrUsername(String emailOrUsername) {
        this.emailOrUsername = emailOrUsername;
    }

    public String getPhone() {
        return phone != null ? phone : emailOrUsername;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
