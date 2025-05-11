import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "admin" && password === "Fse123") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
      <h1 className="login-title">Empowering Safe Classrooms</h1>
<p className="login-desc">
  Welcome to your centralized school vaccination management portal. From student records to drive planning and real-time tracking — everything is designed to keep your campus protected and your data organized. Let's build a healthier school together.
</p>

      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className="login-header">Admin Login</h2>
          <div className="login-form">
            <label>Username</label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
