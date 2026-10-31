package com.lldpad.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String smtpUser;
    private final String smtpPass;

    public MailService(ObjectProvider<JavaMailSender> mailSender,
                       @Value("${spring.mail.username:}") String smtpUser,
                       @Value("${spring.mail.password:}") String smtpPass) {
        this.mailSender = mailSender;
        this.smtpUser = smtpUser;
        this.smtpPass = smtpPass;
    }

    /** Email is only sent when SMTP credentials are configured; otherwise OTPs are logged (dev mode). */
    public boolean isConfigured() {
        return !smtpUser.isBlank() && !smtpPass.isBlank() && mailSender.getIfAvailable() != null;
    }

    public void sendOtp(String to, String otpCode) throws MessagingException {
        MimeMessage message = mailSender.getObject().createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(smtpUser);
        helper.setTo(to);
        helper.setSubject("Your OTP for LLD Pad Signup");
        helper.setText(
                "Your OTP code is: " + otpCode + ". This code will expire in 10 minutes.",
                """
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2>Welcome to LLD Pad!</h2>
                  <p>Your OTP code is: <strong style="font-size: 24px; color: #3b82f6;">%s</strong></p>
                  <p>This code will expire in 10 minutes.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                </div>
                """.formatted(otpCode));
        mailSender.getObject().send(message);
    }
}
