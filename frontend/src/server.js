const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/dang-nhap");
});

app.get("/dang-nhap", (req, res) => {
  res.render("login", { backendUrl: BACKEND_URL });
});

function renderDashboard(roleKey, roleLabel) {
  return (req, res) => {
    res.render("index", { backendUrl: BACKEND_URL, roleKey, roleLabel });
  };
}

app.get("/admin", renderDashboard("ADMIN", "Quản trị viên"));
app.get("/giang-vien", renderDashboard("GIANG_VIEN", "Giảng viên"));
app.get("/truong-nhom", renderDashboard("TRUONG_NHOM", "Trưởng nhóm"));
app.get("/thanh-vien", renderDashboard("THANH_VIEN", "Thành viên"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", frontend: "running" });
});

app.listen(PORT, () => {
  console.log(`Frontend started at http://localhost:${PORT}`);
});
