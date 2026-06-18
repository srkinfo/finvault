package com.finvault.controller;
import com.finvault.dto.AuthDTO;
import com.finvault.entity.User;
import com.finvault.repository.UserRepository;
import com.finvault.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    private AuthDTO.AuthResponse buildAuthResponse(User user, String token) {
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
        return resp;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            return ResponseEntity.badRequest().body("Email already registered");
        User user = User.builder()
                .name(request.getName()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .monthlyIncome(request.getMonthlyIncome()).build();
        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(buildAuthResponse(saved, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }
}