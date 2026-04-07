package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.NhiemVuDTO;
import JAVAGROUP.prjApp.dto.YeuCauDTO;
import JAVAGROUP.prjApp.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }


    @GetMapping("/yeu-cau")
    public ResponseEntity<List<YeuCauDTO>> layYeuCauNhom(@RequestParam UUID idNhom) {
        return ResponseEntity.ok(taskService.layYeuCauNhom(idNhom));
    }


    @GetMapping("/nhiem-vu")
    public ResponseEntity<List<NhiemVuDTO>> layNhiemVuCaNhan(@RequestParam UUID idSinhVien) {
        return ResponseEntity.ok(taskService.layNhiemVuCaNhan(idSinhVien));
    }

    @PatchMapping("/nhiem-vu/{id}/status")
    public ResponseEntity<Map<String, String>> capNhatTrangThai(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        taskService.capNhatTrangThaiTask(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }
}
