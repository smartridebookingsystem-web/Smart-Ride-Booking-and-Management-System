package com.srbms.apigateway.filter;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private RouterValidator routerValidator;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Bypass CORS OPTIONS preflight requests
        if (request.getMethod() != null && "OPTIONS".equalsIgnoreCase(request.getMethod().name())) {
            return chain.filter(exchange);
        }

        boolean isSecured = routerValidator.isSecured.test(request);

        if (isSecured) {
            if (this.isAuthMissing(request)) {
                return this.onError(exchange, "Authorization header is missing", HttpStatus.UNAUTHORIZED);
            }

            final String token = this.getAuthHeader(request);
            if (token == null || !token.startsWith("Bearer ")) {
                return this.onError(exchange, "Authorization header must start with Bearer", HttpStatus.UNAUTHORIZED);
            }

            String jwtToken = token.substring(7);

            if (!jwtUtil.isTokenValid(jwtToken)) {
                return this.onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
            }

            Claims claims = jwtUtil.getAllClaims(jwtToken);
            String userId = String.valueOf(claims.get("userId"));
            String role = String.valueOf(claims.get("role"));
            String email = claims.getSubject();

            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", userId != null && !"null".equalsIgnoreCase(userId) ? userId : "")
                    .header("X-User-Role", role != null && !"null".equalsIgnoreCase(role) ? role : "")
                    .header("X-User-Email", email != null ? email : "")
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } else if (!this.isAuthMissing(request)) {
            try {
                final String token = this.getAuthHeader(request);
                if (token != null && token.startsWith("Bearer ")) {
                    String jwtToken = token.substring(7);
                    if (jwtUtil.isTokenValid(jwtToken)) {
                        Claims claims = jwtUtil.getAllClaims(jwtToken);
                        String userId = String.valueOf(claims.get("userId"));
                        String role = String.valueOf(claims.get("role"));
                        String email = claims.getSubject();

                        ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                .header("X-User-Id", userId != null && !"null".equalsIgnoreCase(userId) ? userId : "")
                                .header("X-User-Role", role != null && !"null".equalsIgnoreCase(role) ? role : "")
                                .header("X-User-Email", email != null ? email : "")
                                .build();

                        return chain.filter(exchange.mutate().request(modifiedRequest).build());
                    }
                }
            } catch (Exception ignored) {
            }
        }

        return chain.filter(exchange);
    }

    private String getAuthHeader(ServerHttpRequest request) {
        return request.getHeaders().getOrEmpty(HttpHeaders.AUTHORIZATION).stream()
                .findFirst()
                .orElse(null);
    }

    private boolean isAuthMissing(ServerHttpRequest request) {
        return !request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Highest priority execution
    }
}
