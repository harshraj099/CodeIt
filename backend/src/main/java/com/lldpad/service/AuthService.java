package com.lldpad.service;

import com.lldpad.config.AppProperties;
import com.lldpad.dto.Dtos.SignupRequest;
import com.lldpad.entity.User;
import com.lldpad.repository.UserRepository;
import com.lldpad.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final SecureRandom RANDOM = new SecureRandom();

    // Cost 10 matches the hashes produced by bcryptjs, so existing passwords keep working.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final UserRepository userRepository;
    private final MailService mailService;
    private final AppProperties props;

    public AuthService(UserRepository userRepository, MailService mailService, AppProperties props) {
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.props = props;
    }

    public User login(String email, String password) {
        if (isBlank(email) || isBlank(password)) {
            throw ApiException.badRequest("Email and password are required");
        }
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword() != null && passwordEncoder.matches(password, u.getPassword()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
    }

    @Transactional
    public Map<String, Object> signup(SignupRequest req) {
        if (isBlank(req.email()) || isBlank(req.username())) {
            throw ApiException.badRequest("Email and username are required");
        }
        if (!EMAIL.matcher(req.email()).matches()) {
            throw ApiException.badRequest("Invalid email format");
        }

        if ("request-otp".equals(req.step())) {
            return requestOtp(req);
        }
        if ("verify-otp".equals(req.step()) && !isBlank(req.otp())) {
            return verifyOtp(req);
        }
        throw ApiException.badRequest("Invalid step or missing OTP");
    }

    private Map<String, Object> requestOtp(SignupRequest req) {
        userRepository.findFirstByEmailOrUsername(req.email(), req.username())
                .filter(u -> u.getPassword() != null && u.getOtp() == null)
                .ifPresent(u -> {
                    throw ApiException.badRequest("User already exists");
                });
        if (isBlank(req.password())) {
            throw ApiException.badRequest("Password is required");
        }
        if (req.password().length() < 6) {
            throw ApiException.badRequest("Password must be at least 6 characters long");
        }

        String otpCode = String.valueOf(100000 + RANDOM.nextInt(900000));
        User user = userRepository.findByEmail(req.email()).orElseGet(User::new);
        user.setEmail(req.email());
        user.setUsername(req.username());
        user.setOtp(otpCode);
        user.setOtpExpires(Instant.now().plus(OTP_TTL));
        user.setPassword(passwordEncoder.encode(req.password()));
        userRepository.save(user);

        boolean emailSent = false;
        if (mailService.isConfigured()) {
            try {
                mailService.sendOtp(req.email(), otpCode);
                emailSent = true;
                log.info("[EMAIL] OTP sent to {}", req.email());
            } catch (Exception e) {
                log.error("Error sending email", e);
                if (props.isProduction()) {
                    throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to send OTP email: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
                }
            }
        } else {
            log.info("\n========================================\n[DEV MODE] OTP for {}: {}\n========================================",
                    req.email(), otpCode);
        }

        boolean isDev = !props.isProduction();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", emailSent
                ? "OTP sent to your email"
                : isDev ? "OTP generated (check console or use the OTP below)" : "OTP sent to your email");
        if (isDev || !emailSent) {
            body.put("otp", otpCode);
        }
        return body;
    }

    private Map<String, Object> verifyOtp(SignupRequest req) {
        User user = userRepository.findByEmail(req.email())
                .filter(u -> u.getOtp() != null && u.getOtpExpires() != null)
                .orElseThrow(() -> ApiException.badRequest("OTP not found or expired. Please request a new OTP."));
        if (!user.getOtp().equals(req.otp())) {
            throw ApiException.badRequest("Invalid OTP");
        }
        if (Instant.now().isAfter(user.getOtpExpires())) {
            throw ApiException.badRequest("OTP expired. Please request a new OTP.");
        }
        user.setOtp(null);
        user.setOtpExpires(null);
        userRepository.save(user);
        return Map.of("success", true, "message", "Account created successfully! Redirecting to login...");
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
