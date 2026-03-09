package com.boip.backend.auth;

import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private final AppUserRepository appUserRepository;
    private final boolean authBypass;

    public FirebaseTokenFilter(@Lazy AppUserRepository appUserRepository,
                               @Value("${boip.auth.bypass:false}") boolean authBypass) {
        this.appUserRepository = appUserRepository;
        this.authBypass = authBypass;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String idToken = header.substring("Bearer ".length()).trim();

        try {
            String uid;
            String email;

            if (authBypass) {
                // In bypass mode the raw token string IS the uid — no Firebase call made
                uid = idToken;
                email = null;
            } else {
                FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);
                uid = decoded.getUid();
                email = decoded.getEmail();
            }

            Object principal;
            List<SimpleGrantedAuthority> authorities;

            AppUser appUser = appUserRepository.findByFirebaseUid(uid).orElse(null);
            if (appUser != null) {
                principal = appUser;
                authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            } else {
                principal = new AuthUser(uid, email, false, Set.of());
                authorities = List.of();
            }

            var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Invalid or expired Firebase token\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
