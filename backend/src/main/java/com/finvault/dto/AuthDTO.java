package com.finvault.dto;
import lombok.Data;
import jakarta.validation.constraints.*;

public class AuthDTO {
    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
        private Double monthlyIncome;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private Long userId;
        public AuthResponse(String token, String name, String email, Long userId) {
            this.token = token; this.name = name;
            this.email = email; this.userId = userId;
        }
    }
}
