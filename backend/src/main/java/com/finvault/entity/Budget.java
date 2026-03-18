package com.finvault.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Transaction.Category category;

    @Column(name = "budget_limit", nullable = false)
    private Double budgetLimit;

    @Column(name = "spent_amount")
    @Builder.Default
    private Double spentAmount = 0.0;

    @Column(name = "month")
    private Integer month;

    @Column(name = "year")
    private Integer year;

    @Column(name = "alert_threshold")
    @Builder.Default
    private Double alertThreshold = 80.0;

    public Double getPercentageUsed() {
        if (budgetLimit == 0) return 0.0;
        return (spentAmount / budgetLimit) * 100;
    }

    public Double getRemainingAmount() {
        return budgetLimit - spentAmount;
    }
}
