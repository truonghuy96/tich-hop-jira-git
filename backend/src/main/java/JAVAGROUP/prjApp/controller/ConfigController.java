package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.service.ConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    @PostMapping("/{idNhom}/jira")
    public ResponseEntity<Map<String, String>> cauHinhJira(
            @PathVariable UUID idNhom,
            @RequestBody Map<String, String> body) {
        configService.cauHinhJira(idNhom, body.get("url"), body.get("token"));
        return ResponseEntity.ok(Map.of("message", "Cấu hình Jira thành công"));
    }

    @PostMapping("/{idNhom}/github")
    public ResponseEntity<Map<String, String>> cauHinhGithub(
            @PathVariable UUID idNhom,
            @RequestBody Map<String, String> body) {
        configService.cauHinhGithub(idNhom, body.get("repo"), body.get("token"), body.get("since"));
        return ResponseEntity.ok(Map.of("message", "Cấu hình GitHub thành công"));
    }
}
