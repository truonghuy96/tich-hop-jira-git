package com.huy.spmtool.service;

import JAVAGROUP.prjApp.dtos.CommitDTO;
import JAVAGROUP.prjApp.dtos.NhiemVuDTO;
import JAVAGROUP.prjApp.dtos.YeuCauDTO;
import JAVAGROUP.prjApp.entities.*;
import JAVAGROUP.prjApp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Tự động tạo Constructor cho các final fields
public class TaskService {

    private final YeuCauRepository yeuCauRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final SinhVienRepository sinhVienRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final CommitVCSRepository commitVCSRepository;
    // Đã xóa nhomRepository vì không sử dụng

    public List<YeuCauDTO> layYeuCauNhom(UUID idNhom) {
        return yeuCauRepository.findByNhom_IdNhom(idNhom)
                .stream()
                .map(yc -> new YeuCauDTO(
                        yc.getIdYeuCau(),
                        yc.getNhom().getIdNhom(),
                        yc.getTieuDe(),
                        yc.getMoTa(),
                        yc.getTrangThai()
                ))
                .toList(); // Dùng .toList() (Java 16+)
    }

    public List<NhiemVuDTO> layNhiemVuNhom(UUID idNhom) {
        return nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null && idNhom.equals(nv.getYeuCau().getNhom().getIdNhom()))
                .map(this::toNhiemVuDTO)
                .toList();
    }

    @Transactional
    public void phanCongNhiemVu(String idNhiemVu, UUID idSinhVien, UUID idNguoiYeuCau) {
        NhiemVu nv = nhiemVuRepository.findById(idNhiemVu)
                .orElseThrow(() -> new RuntimeException("Nhiệm vụ không tồn tại: " + idNhiemVu));

        UUID idNhom = nv.getYeuCau().getNhom().getIdNhom();

        // Kiểm tra quyền LEADER
        ThanhVienNhomId requesterId = new ThanhVienNhomId(idNhom, idNguoiYeuCau);
        ThanhVienNhom thanhVien = thanhVienNhomRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));

        if (thanhVien.getVaiTro() != VaiTroNhom.LEADER) {
            throw new RuntimeException("Chỉ Trưởng nhóm (Leader) mới có quyền phân công nhiệm vụ");
        }

        SinhVien sv = sinhVienRepository.findById(idSinhVien)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại: " + idSinhVien));

        nv.setSinhVien(sv);
        nhiemVuRepository.save(nv);
    }

    public List<NhiemVuDTO> layNhiemVuCaNhan(UUID idSinhVien) {
        return nhiemVuRepository.findBySinhVien_Id(idSinhVien)
                .stream()
                .map(this::toNhiemVuDTO)
                .toList();
    }

    @Transactional
    public void capNhatTrangThaiTask(String idNhiemVu, String status) {
        NhiemVu nv = nhiemVuRepository.findById(idNhiemVu)
                .orElseThrow(() -> new RuntimeException("Nhiệm vụ không tồn tại: " + idNhiemVu));
        nv.setTrangThai(status);
        nv.setThoiGianCapNhat(LocalDateTime.now());
        nhiemVuRepository.save(nv);
    }

    @Transactional(readOnly = true)
    public List<CommitDTO> layCommitNhom(UUID idNhom) {
        return commitVCSRepository.findByYeuCau_Nhom_IdNhom(idNhom)
                .stream()
                .map(c -> {
                    CommitDTO dto = new CommitDTO();
                    dto.setSha(c.getSha());
                    dto.setThongDiep(c.getThongDiep());
                    dto.setThoiGian(c.getThoiGian());
                    if (c.getYeuCau() != null) {
                        dto.setIdYeuCau(c.getYeuCau().getIdYeuCau());
                        dto.setTieuDeYeuCau(c.getYeuCau().getTieuDe());
                    }
                    return dto;
                })
                .toList();
    }

    private NhiemVuDTO toNhiemVuDTO(NhiemVu nv) {
        SinhVien sv = nv.getSinhVien();
        int commitCount = nv.getCommitVCSs() != null ? nv.getCommitVCSs().size() : 0;
        return new NhiemVuDTO(
                nv.getIdNhiemVu(),
                nv.getYeuCau() != null ? nv.getYeuCau().getIdYeuCau() : null,
                sv != null ? sv.getId() : null,
                sv != null ? sv.getHoTen() : null,
                nv.getTieuDe(),
                nv.getTrangThai(),
                commitCount
        );
    }
}