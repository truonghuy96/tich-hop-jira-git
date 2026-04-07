package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.entity.NguoiDung;
import JAVAGROUP.prjApp.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final NguoiDungRepository nguoiDungRepository;

    public AuthService(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    public String dangNhap(String user, String pass) {
        Optional<NguoiDung> found = nguoiDungRepository.findByUsername(user);
        if (found.isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không tồn tại!");
        }
        NguoiDung nguoiDung = found.get();
        // TODO: So sánh password hash (BCrypt) thay vì plain text
        if (!nguoiDung.getPasswordHash().equals(pass)) {
            throw new RuntimeException("Sai mật khẩu!");
        }
        // TODO: Tạo JWT token thực sự ở đây
        return "token-placeholder-for:" + nguoiDung.getUsername();
    }

    public void dangXuat(String token) {
        // TODO: Thêm token vào blacklist Redis hoặc DB
    }
}
