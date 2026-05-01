package com.huy.spmtool.adapter;

import JAVAGROUP.prjApp.dtos.YeuCauDTO;

import java.util.List;

public interface IJiraClient {
    List<YeuCauDTO> layDanhSachYeuCau(String duongDan, String email, String maTruyCap, String maDuAn);
    void kiemTraKetNoi(String duongDan, String email, String maTruyCap, String maDuAn);
}
