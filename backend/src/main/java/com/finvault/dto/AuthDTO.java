package com.finvault.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
        private String phoneNumber;
        private String profilePicture;
        private String currency;
        private String timezone;
        private String language;
        private Double monthlyIncome;
        private Boolean twoFactorEnabled;
        private Boolean emailVerified;
        private LocalDate dateOfBirth;
        private String salaryRange;

        public AuthResponse(String token, String name, String email, Long userId) {
            this.token = token; this.name = name;
            this.email = email; this.userId = userId;
        }
    }

    @Data
    public static class ProfileUpdateRequest {
        private String name;
        private String phoneNumber;
        private LocalDate dateOfBirth;
        private String profilePicture;
        private String currency;
        private String timezone;
        private String language;
        private Double monthlyIncome;
        private String salaryRange;
        private Double savingsGoal;
    }

    @Data
    public static class PasswordChangeRequest {
        @NotBlank private String currentPassword;
        @NotBlank @Size(min = 6) private String newPassword;
    }

    @Data
    public static class AccountStatusResponse {
        private boolean emailVerified;
        private boolean twoFactorEnabled;
        private LocalDate createdAt;
        private LocalDateTime lastLogin;
        private int transactionCount;
        private int budgetCount;
        private int goalCount;
    }

    @Data
    public static class DeleteAccountRequest {
        @NotBlank private String password;
    }
}