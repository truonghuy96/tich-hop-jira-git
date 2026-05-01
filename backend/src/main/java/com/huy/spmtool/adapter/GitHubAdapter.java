package com.huy.spmtool.adapter;

import JAVAGROUP.prjApp.dtos.CommitDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class GitHubAdapter implements IGitHubClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubAdapter.class);
    private final WebClient webClient;

    public GitHubAdapter(WebClient.Builder webClientBuilder) {

        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
    }

    @Override
    public List<CommitDTO> layDanhSachCommit(String repoDauVao, String maTruyCap, String tuNgay) {
        String repoPath = parseRepoPath(repoDauVao);
        log.info("Bắt đầu lấy danh sách commit cho: {}", repoPath);

        try {
            final String token = (maTruyCap != null) ? maTruyCap.trim() : "";


            List<Map<String, Object>> rawCommits = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/repos/{repo}/commits")
                            .queryParamIfPresent("since", Optional.ofNullable(tuNgay))
                            .build(repoPath))
                    .header("Authorization", "token " + token)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();

            List<CommitDTO> result = new ArrayList<>();
            if (rawCommits == null) return result;

            for (Map<String, Object> raw : rawCommits) {
                String sha = (String) raw.get("sha");
                @SuppressWarnings("unchecked")
                Map<String, Object> commitInfo = (Map<String, Object>) raw.get("commit");
                if (commitInfo == null) continue;

                String thongDiep = (String) commitInfo.get("message");
                LocalDateTime thoiGian = parseCommitDate(commitInfo, sha);

                result.add(new CommitDTO(sha, thongDiep != null ? thongDiep : "", thoiGian, null, null, null));
            }
            log.info("Đã đồng bộ thành công {} commits từ GitHub", result.size());
            return result;

        } catch (WebClientResponseException e) {
            log.error("Lỗi GitHub API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("GitHub API Error: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Lỗi bất ngờ: ", e);
            throw new RuntimeException("Lỗi hệ thống khi đồng bộ GitHub: " + e.getMessage());
        }
    }

    @Override
    public void kiemTraKetNoi(String repoDauVao, String maTruyCap) {
        String repoPath = parseRepoPath(repoDauVao);
        try {
            webClient.get()
                    .uri("/repos/{repo}", repoPath)
                    .header("Authorization", "token " + maTruyCap)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Kết nối GitHub thành công: {}", repoPath);
        } catch (WebClientResponseException e) {
            if (e.getStatusCode().value() == 404) throw new RuntimeException("Không tìm thấy Repo (owner/repo).");
            if (e.getStatusCode().value() == 401) throw new RuntimeException("Token GitHub không hợp lệ.");
            throw new RuntimeException("Lỗi kết nối: " + e.getStatusCode().value());
        }
    }

    private String parseRepoPath(String input) {
        if (input == null || input.isEmpty()) return "";

        // Loại bỏ giao thức (chấp nhận cả http và https để xử lý nhưng không để link trần trong code)
        String path = input.replaceAll("(?i)^https?://github\\.com/", "");

        // Xóa dấu / ở cuối và đuôi .git
        path = path.replaceAll("/$", "").replaceAll("(?i)\\.git$", "");

        return path;
    }

    private LocalDateTime parseCommitDate(Map<String, Object> commitInfo, String sha) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> author = (Map<String, Object>) commitInfo.get("author");
            if (author != null && author.get("date") != null) {
                return ZonedDateTime.parse((String) author.get("date")).toLocalDateTime();
            }
        } catch (Exception e) {
            log.warn("Không thể parse ngày cho commit {}: {}", sha, e.getMessage());
        }
        return LocalDateTime.now();
    }
}