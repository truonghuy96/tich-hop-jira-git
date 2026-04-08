# Frontend (NodeJS)

Frontend được xây dựng bằng NodeJS + Express + EJS để thao tác nhanh các API backend.

## 1) Cài đặt

Yêu cầu máy đã cài Node.js (khuyến nghị >= 18):

```bash
cd frontend
npm install
```

## 2) Cấu hình

Tạo file `.env` từ `.env.example`:

```bash
PORT=3000
BACKEND_URL=http://localhost:8080
```

## 3) Chạy frontend

```bash
npm start
```

Mở trình duyệt:
- `http://localhost:3000`
- `http://localhost:3000/dang-nhap`

Sau đăng nhập, hệ thống chuyển theo vai trò:
- `/admin`
- `/giang-vien`
- `/truong-nhom`
- `/thanh-vien`

## 4) Chức năng đã có

- Đăng nhập / đăng xuất và lưu token tạm thời trên màn hình.
- Chuyển đổi giao diện theo vai trò: Quản trị viên, Giảng viên, Trưởng nhóm, Thành viên.
- Lưu phiên local (backend URL, token, role) bằng localStorage.
- Quản lý user (tạo, cập nhật role, xóa).
- Quản lý group (tạo, phân công giảng viên, xem chi tiết, xem thành viên).
- Task (lấy yêu cầu, lấy task cá nhân, cập nhật trạng thái).
- Cấu hình Jira/GitHub.
- Đồng bộ Jira/GitHub + liên kết task-commit.
- Báo cáo tiến độ, commit, đóng góp và xuất CSV.

## 5) Lưu ý

- Backend hiện tại chưa authz đầy đủ, nên frontend đang ở mức giao diện thao tác API.
- Nếu backend đổi schema request/response, cần cập nhật file `src/public/app.js`.
