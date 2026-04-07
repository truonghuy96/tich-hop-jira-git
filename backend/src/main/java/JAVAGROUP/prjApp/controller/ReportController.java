package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.DongGopDTO;
import JAVAGROUP.prjApp.dto.ThongKeGitDTO;
import JAVAGROUP.prjApp.dto.TienDoDTO;
import JAVAGROUP.prjApp.service.ReportService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{idNhom}/progress")
    public ResponseEntity<TienDoDTO> xemTienDo(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemTienDoDuAn(idNhom));
    }

    @GetMapping("/{idNhom}/commits")
    public ResponseEntity<ThongKeGitDTO> thongKeGithub(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.thongKeGithub(idNhom));
    }

    @GetMapping("/{idNhom}/contributions")
    public ResponseEntity<List<DongGopDTO>> xemDongGop(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemDongGopCaNhan(idNhom));
    }

    @GetMapping("/{idNhom}/export")
    public ResponseEntity<Resource> xuatBaoCao(@PathVariable UUID idNhom) {
        Resource file = reportService.xuatBaoCaoTongHop(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"bao-cao-nhom-" + idNhom + ".csv\"")
                .body(file);
    }
}
