package com.lldpad.auth;

import com.lldpad.config.AppProperties;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * HS256 tokens carrying a {@code userId} claim, compatible with tokens issued by the
 * previous jsonwebtoken-based Node backend when the same JWT_SECRET is used.
 */
@Service
public class JwtService {

    public static final Duration TOKEN_TTL = Duration.ofDays(30);

    private final byte[] secret;

    public JwtService(AppProperties props) {
        this.secret = props.jwtSecret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes for HS256");
        }
    }

    public String generateToken(String userId) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .claim("userId", userId)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(TOKEN_TTL)))
                .build();
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(new MACSigner(secret));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }
    }

    public Optional<String> parseUserId(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm()) || !jwt.verify(new MACVerifier(secret))) {
                return Optional.empty();
            }
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.before(new Date())) {
                return Optional.empty();
            }
            return Optional.ofNullable(claims.getStringClaim("userId"));
        } catch (ParseException | JOSEException e) {
            return Optional.empty();
        }
    }
}
