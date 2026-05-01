import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        await fetch("http://localhost:8080/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        alert("Check console backend để lấy link reset");
    };

    return (
        <div>
            <h2>Quên mật khẩu</h2>
            <input
                placeholder="Nhập email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSubmit}>Gửi</button>
        </div>
    );
}