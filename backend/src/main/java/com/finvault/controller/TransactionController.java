package com.finvault.controller;

import com.finvault.entity.Transaction;
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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Transaction> getAll(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId());
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@Valid @RequestBody Transaction transaction, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        transaction.setUser(user);
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDate.now());
        }
        Transaction saved = transactionRepository.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam int month,
            @RequestParam int year,
            Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Long userId = user.getId();

        Double income = transactionRepository.sumByUserIdAndTypeAndMonthAndYear(
                userId, Transaction.TransactionType.INCOME, month, year);
        Double expense = transactionRepository.sumByUserIdAndTypeAndMonthAndYear(
                userId, Transaction.TransactionType.EXPENSE, month, year);

        double inc = income != null ? income : 0.0;
        double exp = expense != null ? expense : 0.0;
        double savings = inc - exp;
        double savingsRate = inc > 0 ? (savings / inc) * 100 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("income", inc);
        stats.put("expense", exp);
        stats.put("savings", savings);
        stats.put("savingsRate", savingsRate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/category/{month}/{year}")
    public ResponseEntity<List<Object[]>> getCategoryExpenses(
            @PathVariable int month, @PathVariable int year, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(
                transactionRepository.getExpensesByCategoryForMonth(user.getId(), month, year));
    }
}
