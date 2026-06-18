package com.finvault.controller;

import com.finvault.dto.AuthDTO;
import com.finvault.entity.User;
import com.finvault.repository.BudgetRepository;
import com.finvault.repository.GoalRepository;
import com.finvault.repository.TransactionRepository;
import com.finvault.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final GoalRepository goalRepository;
    private final PasswordEncoder passwordEncoder;

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        User user = getUser(auth);
        String token = null; // token regeneration handled client-side if needed
        AuthDTO.AuthResponse resp = new AuthDTO.AuthResponse(token, user.getName(), user.getEmail(), user.getId());
        resp.setPhoneNumber(user.getPhoneNumber());
        resp.setProfilePicture(user.getProfilePicture());
        resp.setCurrency(user.getCurrency());
        resp.setTimezone(user.getTimezone());
        resp.setLanguage(user.getLanguage());
        resp.setMonthlyIncome(user.getMonthlyIncome());
        resp.setTwoFactorEnabled(user.getTwoFactorEnabled());
        resp.setEmailVerified(user.getEmailVerified());
        resp.setDateOfBirth(user.getDateOfBirth());
        resp.setSalaryRange(user.getSalaryRange());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody AuthDTO.ProfileUpdateRequest request, Authentication auth) {
        User user = getUser(auth);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
        if (request.getCurrency() != null) user.setCurrency(request.getCurrency());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        if (request.getLanguage() != null) user.setLanguage(request.getLanguage());
        if (request.getMonthlyIncome() != null) user.setMonthlyIncome(request.getMonthlyIncome());
        if (request.getSalaryRange() != null) user.setSalaryRange(request.getSalaryRange());
        if (request.getSavingsGoal() != null) user.setSavingsGoal(request.getSavingsGoal());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        AuthDTO.AuthResponse resp = new AuthDTO.AuthResponse(null, user.getName(), user.getEmail(), user.getId());
        resp.setPhoneNumber(user.getPhoneNumber());
        resp.setProfilePicture(user.getProfilePicture());
        resp.setCurrency(user.getCurrency());
        resp.setTimezone(user.getTimezone());
        resp.setLanguage(user.getLanguage());
        resp.setMonthlyIncome(user.getMonthlyIncome());
        resp.setDateOfBirth(user.getDateOfBirth());
        resp.setSalaryRange(user.getSalaryRange());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody AuthDTO.PasswordChangeRequest request, Authentication auth) {
        User user = getUser(auth);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/toggle-2fa")
    public ResponseEntity<?> toggleTwoFactor(Authentication auth) {
        User user = getUser(auth);
        user.setTwoFactorEnabled(!user.getTwoFactorEnabled());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "twoFactorEnabled", user.getTwoFactorEnabled(),
            "message", user.getTwoFactorEnabled() ? "2FA enabled" : "2FA disabled"
        ));
    }

    @GetMapping("/account-status")
    public ResponseEntity<?> getAccountStatus(Authentication auth) {
        User user = getUser(auth);
        AuthDTO.AccountStatusResponse resp = new AuthDTO.AccountStatusResponse();
        resp.setEmailVerified(user.getEmailVerified() != null ? user.getEmailVerified() : false);
        resp.setTwoFactorEnabled(user.getTwoFactorEnabled() != null ? user.getTwoFactorEnabled() : false);
        resp.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : LocalDate.now());
        resp.setLastLogin(user.getLastLogin());
        resp.setTransactionCount((int) transactionRepository.countByUserId(user.getId()));
        resp.setBudgetCount((int) budgetRepository.countByUserId(user.getId()));
        resp.setGoalCount((int) goalRepository.countByUserId(user.getId()));
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@Valid @RequestBody AuthDTO.DeleteAccountRequest request, Authentication auth) {
        User user = getUser(auth);
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is incorrect"));
        }
        user.setDeletedAt(LocalDateTime.now());
        user.setEmail("deleted_" + user.getId() + "@" + user.getEmail());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Account scheduled for deletion"));
    }
}