package com.huy.spmtool.repositories;

import JAVAGROUP.prjApp.entities.GiangVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GiangVienRepository extends JpaRepository<GiangVien, UUID> {
    Optional<GiangVien> findByMaGiangVien(String maGiangVien);
}
