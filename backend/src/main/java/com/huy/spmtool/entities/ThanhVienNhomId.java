package com.huy.spmtool.entities;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ThanhVienNhomId implements Serializable {
    private UUID idNhom;
    private UUID idSinhVien;
}
