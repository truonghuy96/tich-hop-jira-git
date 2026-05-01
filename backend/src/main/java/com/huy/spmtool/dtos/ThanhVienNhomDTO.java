package com.huy.spmtool.dtos;

import JAVAGROUP.prjApp.entities.VaiTroNhom;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThanhVienNhomDTO {
    private UUID idSinhVien;
    private String maSv;
    private String hoTen;
    private String lop;
    private VaiTroNhom vaiTro;
}
