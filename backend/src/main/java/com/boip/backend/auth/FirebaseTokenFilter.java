package com.boip.backend.auth;

import com.boip.backend.entity.AppUser;
import com.boip.backend.repository.AppUserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private final FirebaseAuth firebaseAuth;

    public FirebaseTokenFilter(@Lazy AppUserRepository appUserRepository,
                               FirebaseAuth firebaseAuth) {
        this.appUserRepository = appUserRepository;
        this.firebaseAuth = firebaseAuth;
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
            FirebaseToken decoded = firebaseAuth.verifyIdToken(idToken);
            String uid = decoded.getUid();
            String email = decoded.getEmail();
            boolean emailVerified = decoded.isEmailVerified();

            Object principal;
            List<SimpleGrantedAuthority> authorities;

            AppUser appUser = appUserRepository.findByFirebaseUid(uid).orElse(null);
            if (appUser != null) {
                principal = appUser;
                authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            } else {
                principal = new AuthUser(uid, email, emailVerified, Set.of());
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
