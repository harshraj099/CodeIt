package com.lldpad.auth;

import com.lldpad.config.AppProperties;
import com.lldpad.web.ApiException;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
public class AuthCookies {

    public static final String NAME = "auth-token";

    private final AppProperties props;
    private final JwtService jwtService;

    public AuthCookies(AppProperties props, JwtService jwtService) {
        this.props = props;
        this.jwtService = jwtService;
    }

    /** Resolves the signed-in user from the auth cookie value, if it is present and valid. */
    public Optional<String> userId(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtService.parseUserId(token);
    }

    public String requireUserId(String token, String message) {
        return userId(token).orElseThrow(() -> ApiException.unauthorized(message));
    }

    public ResponseCookie loginCookie(String userId) {
        return build(jwtService.generateToken(userId), JwtService.TOKEN_TTL);
    }

    public ResponseCookie logoutCookie() {
        return build("", Duration.ZERO);
    }

    private ResponseCookie build(String value, Duration maxAge) {
        return ResponseCookie.from(NAME, value)
                .httpOnly(true)
                .secure(props.isProduction())
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
