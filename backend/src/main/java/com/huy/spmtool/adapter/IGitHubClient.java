package com.huy.spmtool.adapter;

import JAVAGROUP.prjApp.dtos.CommitDTO;

import java.util.List;

public interface IGitHubClient {
    List<CommitDTO> layDanhSachCommit(String repo, String maTruyCap, String tuNgay);

    void kiemTraKetNoi(String repo, String maTruyCap);
}
