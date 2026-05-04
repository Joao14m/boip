package com.boip.backend.config;

import com.boip.backend.auth.AuthUser;
import com.boip.backend.entity.AppUser;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // key: "<scope>:<identifier>" → bucket
    // Grows unbounded; acceptable for current single-instance, low-traffic scale.
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String method = request.getMethod();
        String uri    = request.getRequestURI();

        if ("POST".equals(method) && uri.matches("/api/payments/[^/]+")) {
            String uid = resolveFirebaseUid();
            if (uid == null) return true; // unauthenticated — let Security handle 401/403
            Bucket bucket = buckets.computeIfAbsent(
                    "payments:" + uid,
                    k -> Bucket.builder()
                               .addLimit(Bandwidth.simple(10, Duration.ofMinutes(1)))
                               .build());
            if (bucket.tryConsume(1)) return true;
            return tooManyRequests(response);
        }

        if ("POST".equals(method) && "/auth/onboard".equals(uri)) {
            String ip = request.getRemoteAddr();
            Bucket bucket = buckets.computeIfAbsent(
                    "onboard:" + ip,
                    k -> Bucket.builder()
                               .addLimit(Bandwidth.simple(5, Duration.ofHours(1)))
                               .build());
            if (bucket.tryConsume(1)) return true;
            return tooManyRequests(response);
        }

        return true;
    }

    private String resolveFirebaseUid() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof AppUser u)  return u.getFirebaseUid();
        if (principal instanceof AuthUser u) return u.uid();
        return null;
    }

    private boolean tooManyRequests(HttpServletResponse response) throws Exception {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Too many requests. Please slow down.\"}");
        return false;
    }
}
