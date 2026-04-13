package com.kretea.trends;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TrendsApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrendsApplication.class, args);
    }
}
