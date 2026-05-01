package com.huy.spmtool.security;

import JAVAGROUP.prjApp.entities.NguoiDung;
import JAVAGROUP.prjApp.entities.SinhVien;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;


@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    private final UUID id;
    private final String tenDangNhap;
    private final String matKhauHash;
    private final String hoTen;
    private final String email;
    private final String maVaiTro;
    private final String groupRole; // LEADER, MEMBER
    private final UUID idNhom;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(NguoiDung user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getMaVaiTro()));

        String groupRole = null;
        UUID idNhom = null;

        if (user instanceof SinhVien sv) {
            if (sv.getThanhVienNhoms() != null && !sv.getThanhVienNhoms().isEmpty()) {
                var tv = sv.getThanhVienNhoms().get(0);
                groupRole = tv.getVaiTro().name();
                idNhom = tv.getNhom().getIdNhom();
            }
        }

        return new UserPrincipal(
                user.getId(),
                user.getTenDangNhap(),
                user.getMatKhauHash(),
                user.getHoTen(),
                user.getEmail(),
                user.getMaVaiTro(),
                groupRole,
                idNhom,
                authorities);
    }


    @Override
    public String getUsername() {
        return tenDangNhap;
    }

    @Override
    public String getPassword() {
        return matKhauHash;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


    public String getFullName() {
        return hoTen;
    }

    public String getRoleCode() {
        return maVaiTro;
    }

    public UUID getGroupId() {
        return idNhom;
    }
}