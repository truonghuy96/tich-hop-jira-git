package com.huy.spmtool.repositories;

import JAVAGROUP.prjApp.entities.CommitVCS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommitVCSRepository extends JpaRepository<CommitVCS, String> {
    @Query("SELECT c FROM CommitVCS c " +
            "JOIN FETCH c.yeuCau y " +
            "WHERE y.nhom.idNhom = :idNhom")
    List<CommitVCS> findByYeuCau_Nhom_IdNhom(@Param("idNhom") UUID idNhom);

}