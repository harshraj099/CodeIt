package com.lldpad.controller;

import com.lldpad.auth.AuthCookies;
import com.lldpad.dto.Dtos.LoginRequest;
import com.lldpad.dto.Dtos.SignupRequest;
import com.lldpad.dto.Dtos.UserDto;
import com.lldpad.entity.User;
import com.lldpad.repository.UserRepository;
import com.lldpad.service.AuthService;
import com.lldpad.web.ApiException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthCookies authCookies;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, AuthCookies authCookies, UserRepository userRepository) {
        this.authService = authService;
        this.authCookies = authCookies;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest req) {
        User user = authService.login(req.email(), req.password());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.loginCookie(user.getId()).toString())
                .body(Map.of("success", true, "user", UserDto.from(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.logoutCookie().toString())
                .body(Map.of("success", true));
    }

    @GetMapping("/me")
    public Map<String, Object> me(@CookieValue(name = AuthCookies.NAME, required = false) String token) {
        User user = authCookies.userId(token)
                .flatMap(userRepository::findById)
                .orElseThrow(() -> ApiException.unauthorized("Not authenticated"));
        return Map.of("user", UserDto.from(user));
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody SignupRequest req) {
        return authService.signup(req);
    }
}
