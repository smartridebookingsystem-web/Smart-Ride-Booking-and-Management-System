import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice.js";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(0);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginData = { username, password };

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    })
      .then((resp) => {
        if (resp.status === 200) {
          setMsg("Login successful");
          return resp.json();
        } else if (resp.status === 401) {
          throw new Error("Invalid credentials");
        } else {
          throw new Error(`Request failed with status ${resp.status}`);
        }
      })
      .then((data) => {
        dispatch(login({ user: data.user, token: data.token }));
        if (data.user.role === 1) {
          navigate("/admin");
        } else if (data.user.role === 2) {
          navigate("/driver");
        } else if (data.user.role === 3) {
          navigate("/rider");
        } else {
          setError("Unknown user role");
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="card shadow-lg border-0 opacity-75"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold text-success">Log in</h3>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Your Phone number
              </label>
              <input
                type="text"
                value={username}
                className="form-control"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Your password</label>
              <input
                type="password"
                value={password}
                className="form-control"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember Me */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <div className="d-grid">
              <button type="submit" className="btn btn-success">
                Log in
              </button>
            </div>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none">
              Forgot password?
            </a>
          </div>

          {/* Messages */}
          {msg && <div className="alert alert-success mt-3">{msg}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
    </div>
  );
}
