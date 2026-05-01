package com.huy.spmtool.repositories;

import JAVAGROUP.prjApp.entities.SinhVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, UUID> {
    Optional<SinhVien> findByMaSv(String maSv);
}
