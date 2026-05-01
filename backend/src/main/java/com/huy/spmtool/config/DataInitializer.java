package com.huy.spmtool.config;

import JAVAGROUP.prjApp.entities.*;
import JAVAGROUP.prjApp.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataInitializer implements CommandLineRunner {

    // Xóa nguoiDungRepository vì không sử dụng
    private final QuanTriVienRepository quanTriVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final NhomRepository nhomRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(QuanTriVienRepository quanTriVienRepository,
                           GiangVienRepository giangVienRepository,
                           SinhVienRepository sinhVienRepository,
                           NhomRepository nhomRepository,
                           ThanhVienNhomRepository thanhVienNhomRepository,
                           PasswordEncoder passwordEncoder) {
        this.quanTriVienRepository = quanTriVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.nhomRepository = nhomRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) { // Xóa 'throws Exception' vì không cần thiết

        // 1. Seed Admin
        QuanTriVien admin = quanTriVienRepository.findByMaGv("AD001")
                .orElseGet(() -> {
                    QuanTriVien newAdmin = new QuanTriVien();
                    newAdmin.setMaGv("AD001");
                    return newAdmin;
                });
        admin.setTenDangNhap("admin");
        admin.setMatKhauHash(passwordEncoder.encode("admin"));
        admin.setHoTen("Admin Hệ Thống");
        admin.setEmail("admin@prj.com");
        admin.setTrangThai(TrangThaiUser.ACTIVE);
        admin.setMaVaiTro("ADMIN");
        admin.setCapDoQuyen(1);
        quanTriVienRepository.save(admin);

        // 2. Seed Giang Vien
        GiangVien gv = giangVienRepository.findByMaGiangVien("GV001")
                .orElseGet(() -> {
                    GiangVien newGv = new GiangVien();
                    newGv.setMaGiangVien("GV001");
                    return newGv;
                });
        gv.setTenDangNhap("teacher");
        gv.setMatKhauHash(passwordEncoder.encode("teacher"));
        gv.setHoTen("Giảng Viên Hướng Dẫn");
        gv.setEmail("teacher@prj.com");
        gv.setTrangThai(TrangThaiUser.ACTIVE);
        gv.setMaVaiTro("GIANG_VIEN");
        gv.setKhoa("Công nghệ thông tin");
        final GiangVien finalGv = giangVienRepository.save(gv);

        // 3. Seed Students
        SinhVien leader = sinhVienRepository.findByMaSv("SV001")
                .orElseGet(() -> {
                    SinhVien newL = new SinhVien();
                    newL.setMaSv("SV001");
                    return newL;
                });
        leader.setTenDangNhap("leader");
        leader.setMatKhauHash(passwordEncoder.encode("leader"));
        leader.setHoTen("Sinh Viên Trưởng Nhóm");
        leader.setEmail("leader@prj.com");
        leader.setTrangThai(TrangThaiUser.ACTIVE);
        leader.setMaVaiTro("SINH_VIEN");
        leader.setLop("K65-CNTT");
        final SinhVien finalLeader = sinhVienRepository.save(leader);

        SinhVien member = sinhVienRepository.findByMaSv("SV002")
                .orElseGet(() -> {
                    SinhVien newM = new SinhVien();
                    newM.setMaSv("SV002");
                    return newM;
                });
        member.setTenDangNhap("member");
        member.setMatKhauHash(passwordEncoder.encode("member"));
        member.setHoTen("Sinh Viên Thành Viên");
        member.setEmail("member@prj.com");
        member.setTrangThai(TrangThaiUser.ACTIVE);
        member.setMaVaiTro("SINH_VIEN");
        member.setLop("K65-CNTT");
        final SinhVien finalMember = sinhVienRepository.save(member);

        // 4. Seed Nhom (Group)
        if (nhomRepository.findAll().stream().noneMatch(n -> n.getTenNhom().contains("JiraGit"))) {
            Nhom nhom = new Nhom();
            nhom.setTenNhom("Nhóm 1 - Dự án JiraGit");
            nhom.setDeTai("Xây dựng hệ thống quản lý đồ án sinh viên tích hợp Jira/GitHub");
            nhom.setGiangVien(finalGv);
            nhom = nhomRepository.save(nhom);

            // Add members to group
            ThanhVienNhom leaderReg = new ThanhVienNhom();
            leaderReg.setId(new ThanhVienNhomId(nhom.getIdNhom(), finalLeader.getId()));
            leaderReg.setNhom(nhom);
            leaderReg.setSinhVien(finalLeader);
            leaderReg.setVaiTro(VaiTroNhom.LEADER);
            thanhVienNhomRepository.save(leaderReg);

            ThanhVienNhom memberReg = new ThanhVienNhom();
            memberReg.setId(new ThanhVienNhomId(nhom.getIdNhom(), finalMember.getId()));
            memberReg.setNhom(nhom);
            memberReg.setSinhVien(finalMember);
            memberReg.setVaiTro(VaiTroNhom.MEMBER);
            thanhVienNhomRepository.save(memberReg);
        }

        System.out.println(">>> Hệ thống đã cập nhật/khởi tạo tài khoản test thành công!");
    }
}