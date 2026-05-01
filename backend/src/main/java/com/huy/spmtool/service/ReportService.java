package com.huy.spmtool.service;

import JAVAGROUP.prjApp.dtos.DongGopDTO;
import JAVAGROUP.prjApp.dtos.ThongKeGitDTO;
import JAVAGROUP.prjApp.dtos.TienDoDTO;
import JAVAGROUP.prjApp.entities.*;
import JAVAGROUP.prjApp.repositories.*;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final NhiemVuRepository nhiemVuRepository;
    private final CommitVCSRepository commitVCSRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final YeuCauRepository yeuCauRepository;

    public TienDoDTO xemTienDoDuAn(UUID idNhom) {
        List<NhiemVu> tasks = nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null && nv.getYeuCau().getNhom() != null
                        && idNhom.equals(nv.getYeuCau().getNhom().getIdNhom()))
                .toList();
        int total = tasks.size();
        long done = tasks.stream().filter(nv -> "DONE".equalsIgnoreCase(nv.getTrangThai())).count();
        double percent = total == 0 ? 0.0 : (double) done / total * 100;
        return new TienDoDTO(idNhom, total, (int) done, percent);
    }

    public ThongKeGitDTO thongKeGithub(UUID idNhom) {
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null && c.getNhiemVu().getYeuCau() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom()))
                .toList();
        Map<String, Integer> commitMap = new HashMap<>();
        for (CommitVCS c : commits) {
            if (c.getSinhVien() != null) {
                commitMap.merge(c.getSinhVien().getHoTen(), 1, Integer::sum);
            }
        }
        return new ThongKeGitDTO(commitMap);
    }

    public List<DongGopDTO> xemDongGopCaNhan(UUID idNhom) {
        return thanhVienNhomRepository.findById_IdNhom(idNhom).stream()
                .map(tv -> {
                    SinhVien sv = tv.getSinhVien();
                    long doneTasks = nhiemVuRepository.findBySinhVien_Id(sv.getId()).stream()
                            .filter(nv -> "DONE".equalsIgnoreCase(nv.getTrangThai())).count();
                    long commitCount = commitVCSRepository.findAll().stream()
                            .filter(c -> c.getSinhVien() != null && sv.getId().equals(c.getSinhVien().getId())).count();
                    return new DongGopDTO(sv.getId(), sv.getHoTen(), (int) doneTasks, (int) commitCount);
                }).toList();
    }

    public List<Map<String, Object>> xemLichSuTienDo(UUID idNhom) {
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null && c.getNhiemVu().getYeuCau() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom()) && c.getThoiGian() != null)
                .sorted(Comparator.comparing(CommitVCS::getThoiGian)).toList();
        Map<String, Integer> countPerDay = new LinkedHashMap<>();
        for (CommitVCS c : commits) {
            countPerDay.merge(c.getThoiGian().toLocalDate().toString(), 1, Integer::sum);
        }
        List<Map<String, Object>> data = new ArrayList<>();
        countPerDay.forEach((date, count) -> {
            Map<String, Object> point = new HashMap<>();
            point.put("ngay", date);
            point.put("hoanThanh", count);
            data.add(point);
        });
        return data;
    }

    public List<Map<String, Object>> xemLichSuCommitNhom(UUID idNhom) {
        return xemLichSuTienDo(idNhom);
    }

    public List<Map<String, Object>> xemLichSuCommitCaNhan(UUID idSinhVien) {
        // Sử dụng tham số idSinhVien để tránh cảnh báo "Parameter never used"
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getSinhVien() != null && idSinhVien.equals(c.getSinhVien().getId()))
                .toList();

        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, Integer> counts = new HashMap<>();
        for (CommitVCS c : commits) {
            counts.merge(c.getThoiGian().toLocalDate().toString(), 1, Integer::sum);
        }
        counts.forEach((k, v) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("ngay", k);
            m.put("count", v);
            data.add(m);
        });
        return data;
    }

    public Resource xuatBaoCaoPdf(UUID idNhom) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("BAO CAO CHI TIET NHOM: " + idNhom));
            document.close();
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception e) { throw new RuntimeException("Lỗi tạo PDF", e); }
    }

    public Resource xuatBaoCaoTongHop(UUID idNhom) {
        return xuatBaoCaoPdf(idNhom);
    }

    public Resource xuatBaoCaoDocx(UUID idNhom) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("Bao cao tien do nhom: " + idNhom);
            doc.write(out);
            return new ByteArrayResource(out.toByteArray());
        }
    }

    public Resource xuatBaoCaoSRS(UUID idNhom) throws IOException {
        // Sử dụng yeuCauRepository để hết cảnh báo "never accessed"
        List<YeuCau> list = yeuCauRepository.findByNhom_IdNhom(idNhom);
        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText("SRS Document cho nhom: " + idNhom);
            for (YeuCau yc : list) {
                doc.createParagraph().createRun().setText("- " + yc.getTieuDe());
            }
            doc.write(out);
            return new ByteArrayResource(out.toByteArray());
        }
    }
}