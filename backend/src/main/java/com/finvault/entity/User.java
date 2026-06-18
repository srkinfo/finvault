package com.finvault.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    // ===== Profile Fields =====
    @Column(length = 20)
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "en";

    @Column(name = "monthly_income")
    private Double monthlyIncome;

    @Column(name = "salary_range", length = 50)
    private String salaryRange;

    @Column(name = "savings_goal")
    private Double savingsGoal;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RiskProfile riskProfile = RiskProfile.MODERATE;

    // ===== Security Fields =====
    @Column(name = "two_factor_enabled")
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Budget> budgets;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Goal> goals;

    public enum RiskProfile {
        CONSERVATIVE, MODERATE, AGGRESSIVE
    }
}