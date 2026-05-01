package com.huy.spmtool.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeGitDTO {
    private Map<String, Integer> soCommitTheoSinhVien;

    // Phải có constructor này
    public ThongKeGitDTO(Map<String, Integer> soCommitTheoSinhVien) {
        this.soCommitTheoSinhVien = soCommitTheoSinhVien;
    }
    
    // Thống kê nâng cao theo yêu cầu
    private Map<String, Double> chiSoTanSuat; // Độ đều đặn (0.0 - 1.0)
    private Map<String, Double> chiSoChatLuong; // Chất lượng thông điệp và mapping (0.0 - 1.0)
}
