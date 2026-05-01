package com.huy.spmtool.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "SINH_VIEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SinhVien extends NguoiDung {

    @Column(name = "ma_sv", nullable = false, unique = true)
    private String maSv;

    @Column(name = "lop")
    private String lop;

    @OneToMany(mappedBy = "sinhVien")
    private List<ThanhVienNhom> thanhVienNhoms;
}
