package com.huy.spmtool.repositories;

import JAVAGROUP.prjApp.entities.TokenDatLaiMatKhau;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenDatLaiMatKhauRepository extends JpaRepository<TokenDatLaiMatKhau, Long> {
    Optional<TokenDatLaiMatKhau> findByToken(String token);
}