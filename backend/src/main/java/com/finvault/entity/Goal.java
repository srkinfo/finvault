package com.finvault.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(name = "target_amount", nullable = false)
    private Double targetAmount;

    @Column(name = "current_amount")
    @Builder.Default
    private Double currentAmount = 0.0;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private GoalType type;

    @Column(name = "icon")
    private String icon;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Double getProgressPercentage() {
        if (targetAmount == 0) return 0.0;
        return Math.min((currentAmount / targetAmount) * 100, 100.0);
    }

    public Double getRemainingAmount() {
        return Math.max(targetAmount - currentAmount, 0.0);
    }

    public enum GoalStatus { ACTIVE, COMPLETED, PAUSED, CANCELLED }
    public enum GoalType {
        EMERGENCY_FUND, VACATION, HOME_PURCHASE, CAR,
        EDUCATION, RETIREMENT, WEDDING, GADGET, BUSINESS, CUSTOM
    }
}
