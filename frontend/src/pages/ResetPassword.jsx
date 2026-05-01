import { useState } from "react";

export default function ResetPassword() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const [password, setPassword] = useState("");

    const handleReset = async () => {
        await fetch("http://localhost:8080/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token, password })
        });

        alert("Đổi mật khẩu thành công");
    };

    return (
        <div>
            <h2>Đặt lại mật khẩu</h2>
            <input
                type="password"
                placeholder="Mật khẩu mới"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleReset}>Xác nhận</button>
        </div>
    );
}