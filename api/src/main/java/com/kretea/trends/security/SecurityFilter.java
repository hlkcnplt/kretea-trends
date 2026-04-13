package com.kretea.trends.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "X-KRETEA-AUTH";
    private static final String INGEST_URI = "/v1/trends/ingest";

    @Value("${kretea.auth.secret}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().startsWith(INGEST_URI) && request.getMethod().equalsIgnoreCase("POST")) {
            String providedSecret = request.getHeader(AUTH_HEADER);

            if (providedSecret == null || !providedSecret.equals(expectedSecret)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
