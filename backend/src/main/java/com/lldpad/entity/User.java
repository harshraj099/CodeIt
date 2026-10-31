package com.lldpad.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    // Hashed password for login
    private String password;

    // OTP for signup verification
    private String otp;

    private Instant otpExpires;

    @CreatedDate
    private Instant createdAt;

    public String getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public Instant getOtpExpires() { return otpExpires; }
    public void setOtpExpires(Instant otpExpires) { this.otpExpires = otpExpires; }
    public Instant getCreatedAt() { return createdAt; }
}
