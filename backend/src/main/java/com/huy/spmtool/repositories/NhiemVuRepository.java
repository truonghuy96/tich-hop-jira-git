package com.huy.spmtool.repositories;

import JAVAGROUP.prjApp.entities.NhiemVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NhiemVuRepository extends JpaRepository<NhiemVu, String> {
    List<NhiemVu> findBySinhVien_Id(UUID idSinhVien);
}