package com.finvault.controller;

import com.finvault.entity.Budget;
import com.finvault.entity.Transaction;
import com.finvault.repository.BudgetRepository;
import com.finvault.repository.TransactionRepository;
import com.finvault.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAll(Authentication auth,
                                    @RequestParam(required = false) Integer month,
                                    @RequestParam(required = false) Integer year) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), m, y);

        // Update spent amounts from actual transactions
        List<Object[]> expenses = transactionRepository.getExpensesByCategoryForMonth(user.getId(), m, y);
        Map<String, Double> categorySpent = new HashMap<>();
        for (Object[] row : expenses) {
            Transaction.Category cat = (Transaction.Category) row[0];
            Double amt = (Double) row[1];
            categorySpent.put(cat.name(), amt != null ? amt : 0.0);
        }

        for (Budget b : budgets) {
            Double spent = categorySpent.getOrDefault(b.getCategory().name(), 0.0);
            b.setSpentAmount(spent);
        }

        return ResponseEntity.ok(budgets);
    }

    @PostMapping
    public ResponseEntity<Budget> create(@Valid @RequestBody Budget budget, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        budget.setUser(user);
        budget.setSpentAmount(0.0);
        if (budget.getMonth() == null) budget.setMonth(LocalDate.now().getMonthValue());
        if (budget.getYear() == null) budget.setYear(LocalDate.now().getYear());
        if (budget.getAlertThreshold() == null) budget.setAlertThreshold(80.0);
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetRepository.save(budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> update(@PathVariable Long id, @Valid @RequestBody Budget updated, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        var budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if (updated.getCategory() != null) budget.setCategory(updated.getCategory());
        if (updated.getBudgetLimit() != null) budget.setBudgetLimit(updated.getBudgetLimit());
        if (updated.getAlertThreshold() != null) budget.setAlertThreshold(updated.getAlertThreshold());
        if (updated.getMonth() != null) budget.setMonth(updated.getMonth());
        if (updated.getYear() != null) budget.setYear(updated.getYear());
        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        var budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        budgetRepository.delete(budget);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/overview/{month}/{year}")
    public ResponseEntity<Map<String, Object>> getOverview(
            @PathVariable int month, @PathVariable int year, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
        double totalBudget = budgets.stream().mapToDouble(Budget::getBudgetLimit).sum();
        double totalSpent = budgets.stream().mapToDouble(Budget::getSpentAmount).sum();

        List<Object[]> expenses = transactionRepository.getExpensesByCategoryForMonth(user.getId(), month, year);
        double actualTotalSpent = 0;
        for (Object[] row : expenses) {
            actualTotalSpent += (Double) row[1];
        }

        Double income = transactionRepository.sumByUserIdAndTypeAndMonthAndYear(
                user.getId(), Transaction.TransactionType.INCOME, month, year);

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalBudget", totalBudget);
        overview.put("totalSpent", Math.max(totalSpent, actualTotalSpent));
        overview.put("totalIncome", income != null ? income : 0);
        overview.put("budgetCount", budgets.size());
        overview.put("alertCount", budgets.stream().filter(b -> b.getPercentageUsed() >= b.getAlertThreshold()).count());
        return ResponseEntity.ok(overview);
    }
}
