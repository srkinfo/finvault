package com.finvault.controller;

import com.finvault.entity.Goal;
import com.finvault.repository.GoalRepository;
import com.finvault.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Goal> getAll(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @PostMapping
    public ResponseEntity<Goal> create(@Valid @RequestBody Goal goal, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        goal.setUser(user);
        if (goal.getCurrentAmount() == null) goal.setCurrentAmount(0.0);
        if (goal.getStatus() == null) goal.setStatus(Goal.GoalStatus.ACTIVE);
        return ResponseEntity.status(HttpStatus.CREATED).body(goalRepository.save(goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> update(@PathVariable Long id, @Valid @RequestBody Goal updated, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        var goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if (updated.getName() != null) goal.setName(updated.getName());
        if (updated.getDescription() != null) goal.setDescription(updated.getDescription());
        if (updated.getTargetAmount() != null) goal.setTargetAmount(updated.getTargetAmount());
        if (updated.getCurrentAmount() != null) goal.setCurrentAmount(updated.getCurrentAmount());
        if (updated.getTargetDate() != null) goal.setTargetDate(updated.getTargetDate());
        if (updated.getStatus() != null) goal.setStatus(updated.getStatus());
        if (updated.getType() != null) goal.setType(updated.getType());
        if (updated.getIcon() != null) goal.setIcon(updated.getIcon());
        return ResponseEntity.ok(goalRepository.save(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        var goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        goalRepository.delete(goal);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<Goal> addProgress(@PathVariable Long id, @RequestBody AddProgressRequest request, Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        var goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        goal.setCurrentAmount(goal.getCurrentAmount() + request.amount());
        if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
            goal.setStatus(Goal.GoalStatus.COMPLETED);
        }
        return ResponseEntity.ok(goalRepository.save(goal));
    }

    public record AddProgressRequest(Double amount) {}
}
