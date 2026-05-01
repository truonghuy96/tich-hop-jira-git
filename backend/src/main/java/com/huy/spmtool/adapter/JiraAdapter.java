package com.huy.spmtool.adapter;

import JAVAGROUP.prjApp.dtos.YeuCauDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Component
public class JiraAdapter implements IJiraClient {

    private static final Logger log = LoggerFactory.getLogger(JiraAdapter.class);
    private final WebClient webClient;

    public JiraAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public List<YeuCauDTO> layDanhSachYeuCau(String duongDan, String email, String maTruyCap, String maDuAn) {
        log.info("Đang lấy danh sách yêu cầu từ Jira: {} cho dự án: {}", duongDan, maDuAn);
        try {
            String auth = email + ":" + maTruyCap;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            Map<String, Object> body = new HashMap<>();
            body.put("jql", "project='" + maDuAn + "'");
            body.put("fields", List.of("summary", "status", "description"));

            Map<String, Object> response = webClient.post()
                    .uri(duongDan + "/rest/api/3/search") // Thường endpoint search là đủ, không cần /jql ở cuối
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            List<YeuCauDTO> result = new ArrayList<>();
            if (response == null || response.get("issues") == null) return result;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> issues = (List<Map<String, Object>>) response.get("issues");

            for (Map<String, Object> issue : issues) {
                try {
                    // XÓA BIẾN 'id' DƯ THỪA (Sửa lỗi "Variable 'id' is never used")
                    String key = (String) issue.get("key");

                    @SuppressWarnings("unchecked")
                    Map<String, Object> fields = (Map<String, Object>) issue.get("fields");
                    if (fields == null) continue;

                    String tieuDe = (String) fields.getOrDefault("summary", "No Title");

                    // Xử lý mô tả (Description) của Jira v3 (ADF)
                    String moTa = parseJiraDescription(fields.get("description"));

                    String trangThai = "TODO";
                    if (fields.get("status") != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> statusMap = (Map<String, Object>) fields.get("status");
                        trangThai = statusMap.get("name").toString();
                    }

                    result.add(new YeuCauDTO(key, null, tieuDe, moTa, trangThai));
                } catch (Exception e) {
                    log.warn("Bỏ qua 1 task do lỗi: {}", e.getMessage());
                }
            }
            return result;
        } catch (WebClientResponseException e) {
            log.error("Lỗi Jira API: {}", e.getStatusCode());
            throw new RuntimeException("Lỗi kết nối Jira: " + e.getStatusCode().value());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi đồng bộ Jira: " + e.getMessage());
        }
    }

    private String parseJiraDescription(Object rawDesc) {
        if (rawDesc == null) return "";
        if (rawDesc instanceof String) return (String) rawDesc;

        try {

            return "Mô tả dạng Rich Text (Xem trên Jira)";
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    public void kiemTraKetNoi(String duongDan, String email, String maTruyCap, String maDuAn) {
        try {
            String auth = email + ":" + maTruyCap;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            webClient.get()
                    .uri(duongDan + "/rest/api/3/project/{key}", maDuAn)
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Kết nối Jira thành công!");
        } catch (WebClientResponseException e) {
            if (e.getStatusCode().value() == 401) throw new RuntimeException("Email hoặc API Token sai.");
            if (e.getStatusCode().value() == 404) throw new RuntimeException("Không tìm thấy Project Key.");
            throw new RuntimeException("Lỗi: " + e.getStatusCode().value());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống: " + e.getMessage());
        }
    }
}