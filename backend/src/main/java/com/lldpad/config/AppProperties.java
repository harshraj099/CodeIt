package com.lldpad.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String env,
        String jwtSecret,
        String pistonApiUrl,
        List<String> corsAllowedOrigins
) {
    public boolean isProduction() {
        return "production".equalsIgnoreCase(env);
    }
}
