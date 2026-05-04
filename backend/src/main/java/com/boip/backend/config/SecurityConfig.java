package com.boip.backend.config;

import com.boip.backend.auth.FirebaseTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, FirebaseTokenFilter firebaseTokenFilter) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Infra / plumbing.
                        .requestMatchers("/health", "/error").permitAll()
                        // Needed by clients that have a Firebase token but no AppUser yet.
                        .requestMatchers(HttpMethod.GET, "/auth/me").permitAll()
                        // Asaas webhook callback — authenticated via shared-secret header, not Firebase.
                        .requestMatchers(HttpMethod.POST, "/api/webhooks/asaas").permitAll()
                        // Webhook management — called by start.py at startup; authenticated via shared-secret header.
                        .requestMatchers(HttpMethod.GET,    "/api/webhooks").permitAll()
                        .requestMatchers(HttpMethod.POST,   "/api/webhooks/register").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/webhooks/*").permitAll()
                        // Everything else (listings feed, locations, user lookups, etc.) requires login.
                        .anyRequest().authenticated()
                )
                .addFilterBefore(firebaseTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
