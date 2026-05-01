package com.huy.spmtool.controllers;

import JAVAGROUP.prjApp.security.UserPrincipal;
import JAVAGROUP.prjApp.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            String token = authService.dangNhap(username, password);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("message", "Login successful");

            response.put("id", principal.getId());
            response.put("username", principal.getUsername());
            response.put("fullName", principal.getFullName());
            response.put("email", principal.getEmail());
            response.put("roleCode", principal.getRoleCode());
            response.put("groupRole", principal.getGroupRole());
            response.put("groupId", principal.getGroupId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("message", "Đăng nhập thất bại: " + e.getMessage());
            return ResponseEntity.status(401).body(errorRes);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        authService.dangXuat(authHeader);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        authService.guiYeuCauDatLaiMatKhau(email);
        return ResponseEntity.ok(Map.of("message", "Yêu cầu đã được gửi, vui lòng kiểm tra console/email"));
    }

    // THÊM MỚI: Endpoint này dùng để xóa cảnh báo "kiemTraTokenHopLe is never used"
    // Frontend sẽ gọi cái này khi người dùng vừa nhấn vào link từ Email
    @GetMapping("/reset-password/validate")
    public ResponseEntity<Map<String, Object>> validateResetToken(@RequestParam String token) {
        boolean isValid = authService.kiemTraTokenHopLe(token);
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "Token hợp lệ"));
        }
        return ResponseEntity.status(400).body(Map.of("valid", false, "message", "Token không hợp lệ hoặc đã hết hạn"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");

            authService.doiMatKhauVoiToken(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được thay đổi thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }
}