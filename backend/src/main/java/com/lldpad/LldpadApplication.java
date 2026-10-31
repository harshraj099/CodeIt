package com.lldpad;

import com.lldpad.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class LldpadApplication {

    public static void main(String[] args) {
        SpringApplication.run(LldpadApplication.class, args);
    }
}
