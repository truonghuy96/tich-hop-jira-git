package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.NhomDTO;
import JAVAGROUP.prjApp.dto.ThanhVienNhomDTO;
import JAVAGROUP.prjApp.entity.Nhom;
import JAVAGROUP.prjApp.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<NhomDTO> taoNhom(@RequestBody NhomDTO dto) {
        Nhom nhom = groupService.taoNhom(dto);
        return ResponseEntity.ok(groupService.xemThongTinNhom(nhom.getIdNhom()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> xoaNhom(@PathVariable UUID id) {
        groupService.xoaNhom(id);
        return ResponseEntity.ok(Map.of("message", "Xoá nhóm thành công"));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Map<String, String>> phanCongGiangVien(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        groupService.phanCongGiangVien(id, UUID.fromString(body.get("idGiangVien")));
        return ResponseEntity.ok(Map.of("message", "Phân công giảng viên thành công"));
    }

    @GetMapping
    public ResponseEntity<List<NhomDTO>> layDanhSachNhom(@RequestParam UUID idGiangVien) {
        return ResponseEntity.ok(groupService.layDanhSachNhom(idGiangVien));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhomDTO> xemThongTinNhom(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.xemThongTinNhom(id));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<ThanhVienNhomDTO>> layDanhSachThanhVien(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.layDanhSachThanhVien(id));
    }
}
