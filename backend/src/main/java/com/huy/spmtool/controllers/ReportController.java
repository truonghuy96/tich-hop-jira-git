package com.huy.spmtool.controllers;

import JAVAGROUP.prjApp.dtos.DongGopDTO;
import JAVAGROUP.prjApp.dtos.ThongKeGitDTO;
import JAVAGROUP.prjApp.dtos.TienDoDTO;
import JAVAGROUP.prjApp.services.ReportService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Xem tiến độ dự án: tổng nhiệm vụ, hoàn thành, % tiến độ
     */
    @GetMapping("/{idNhom}/progress")
    public ResponseEntity<TienDoDTO> xemTienDo(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemTienDoDuAn(idNhom));
    }

    /**
     * Thống kê số commit GitHub của nhóm
     */
    @GetMapping("/{idNhom}/commits")
    public ResponseEntity<ThongKeGitDTO> thongKeGithub(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.thongKeGithub(idNhom));
    }

    /**
     * Xem đóng góp cá nhân (số task xong, số commit)
     */
    @GetMapping("/{idNhom}/contributions")
    public ResponseEntity<List<DongGopDTO>> xemDongGop(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemDongGopCaNhan(idNhom));
    }

    /**
     * Lịch sử biến động tiến độ (AreaChart)
     */
    @GetMapping("/{idNhom}/history")
    public ResponseEntity<List<Map<String, Object>>> xemLichSuTienDo(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemLichSuTienDo(idNhom));
    }

    /**
     * Lịch sử commit của cả nhóm (Heatmap/BarChart)
     */
    @GetMapping("/{idNhom}/commits/history")
    public ResponseEntity<List<Map<String, Object>>> xemLichSuCommitNhom(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemLichSuCommitNhom(idNhom));
    }

    /**
     * Lịch sử commit cá nhân (Line Chart)
     */
    @GetMapping("/personal/{idSinhVien}/history")
    public ResponseEntity<List<Map<String, Object>>> xemLichSuCommitCaNhan(@PathVariable UUID idSinhVien) {
        return ResponseEntity.ok(reportService.xemLichSuCommitCaNhan(idSinhVien));
    }

    /**
     * Xuất báo cáo tổng hợp (CSV)
     */
    @GetMapping("/{idNhom}/export")
    public ResponseEntity<Resource> xuatBaoCao(@PathVariable UUID idNhom) {
        Resource file = reportService.xuatBaoCaoTongHop(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report-" + idNhom + ".csv\"")
                .body(file);
    }

    /**
     * Xuất báo cáo PDF
     */
    @GetMapping("/{idNhom}/export/pdf")
    public ResponseEntity<Resource> xuatBaoCaoPdf(@PathVariable UUID idNhom) {
        Resource file = reportService.xuatBaoCaoPdf(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report-" + idNhom + ".pdf\"")
                .body(file);
    }

    /**
     * Xuất báo cáo DOCX
     */
    @GetMapping("/{idNhom}/export/docx")
    public ResponseEntity<Resource> xuatBaoCaoDocx(@PathVariable UUID idNhom) throws IOException {
        Resource file = reportService.xuatBaoCaoDocx(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report-" + idNhom + ".docx\"")
                .body(file);
    }

    /**
     * Xuất tài liệu Đặc tả yêu cầu phần mềm (SRS)
     */
    @GetMapping("/{idNhom}/export/srs")
    public ResponseEntity<Resource> xuatBaoCaoSRS(@PathVariable UUID idNhom) throws IOException {
        Resource file = reportService.xuatBaoCaoSRS(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SRS-" + idNhom + ".docx\"")
                .body(file);
    }
}