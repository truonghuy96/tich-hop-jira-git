package com.huy.spmtool.service;

import JAVAGROUP.prjApp.entities.BlacklistedToken;
import JAVAGROUP.prjApp.entities.NguoiDung;
import JAVAGROUP.prjApp.entities.TokenDatLaiMatKhau;
import JAVAGROUP.prjApp.repositories.BlacklistedTokenRepository;
import JAVAGROUP.prjApp.repositories.NguoiDungRepository;
import JAVAGROUP.prjApp.repositories.TokenDatLaiMatKhauRepository;
import JAVAGROUP.prjApp.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final TokenDatLaiMatKhauRepository tokenRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       BlacklistedTokenRepository blacklistedTokenRepository,
                       TokenDatLaiMatKhauRepository tokenRepository,
                       NguoiDungRepository nguoiDungRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.tokenRepository = tokenRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ... (Các hàm dangNhap, dangXuat giữ nguyên) ...

    public String dangNhap(String tenDangNhap, String matKhau) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(tenDangNhap, matKhau)
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);
    }

    public void dangXuat(String authHeader) {
        String token = authHeader;
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && tokenProvider.validateToken(token)) {
            Date expiryDate = tokenProvider.getExpirationDateFromJWT(token);
            LocalDateTime expiryLDT = expiryDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            BlacklistedToken blacklisted = new BlacklistedToken();
            blacklisted.setToken(token);
            blacklisted.setExpiryDate(expiryLDT);
            blacklistedTokenRepository.save(blacklisted);
            SecurityContextHolder.clearContext();
        }
    }

    public void guiYeuCauDatLaiMatKhau(String email) {
        String token = UUID.randomUUID().toString();
        TokenDatLaiMatKhau entity = new TokenDatLaiMatKhau();
        entity.setToken(token);
        entity.setEmail(email);
        tokenRepository.save(entity);

        System.out.println("=== RESET PASSWORD ===");
        System.out.println("Link: http://localhost:3000/reset-password?token=" + token);
    }

    public boolean kiemTraTokenHopLe(String token) {
        return tokenRepository.findByToken(token).isPresent();
    }

    @Transactional
    public void doiMatKhauVoiToken(String token, String matKhauMoi) {
        // 1. Tìm token
        TokenDatLaiMatKhau tokenEntity = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ hoặc đã hết hạn"));

        // 2. Tìm người dùng theo email từ token
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(tokenEntity.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 3. Sử dụng matKhauMoi để cập nhật (Hết lỗi Unused Parameter)
        nguoiDung.setMatKhauHash(passwordEncoder.encode(matKhauMoi));
        nguoiDungRepository.save(nguoiDung);

        // 4. Xóa token sau khi dùng
        tokenRepository.delete(tokenEntity);
    }
}