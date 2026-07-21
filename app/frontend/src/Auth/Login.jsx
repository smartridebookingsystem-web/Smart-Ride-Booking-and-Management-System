import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice.js";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setMsg("");

    const loginData = {
      username,
      password,
    };

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((resp) => {
        if (resp.status === 200) {
          return resp.json();
        } else if (resp.status === 401) {
          throw new Error("Invalid Mobile Number or Password.");
        } else {
          throw new Error("Unable to login. Please try again.");
        }
      })
      .then((data) => {
        dispatch(
          login({
            user: data.user,
            token: data.token,
          }),
        );

        setMsg("Login Successful.");

        if (data.user.role === 1) {
          navigate("/admin");
        } else if (data.user.role === 2) {
          navigate("/driver");
        } else if (data.user.role === 3) {
          navigate("/rider");
        } else {
          setError("Unknown User Role");
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="container-fluid  d-flex justify-content-center align-items-center">
      <div
        className="card border-0 shadow-lg"
        style={{
          maxWidth: "70%",
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Card Header */}

        <div
          className="text-center py-4"
          style={{
            background: "var(--primary)",
            color: "#fff",
            opacity: "0.9",
          }}
        >
          <i
            className="bi bi-car-front-fill"
            style={{
              fontSize: "3rem",
            }}
          ></i>

          <h2 className="fw-bold mt-2 mb-1">SmartRide</h2>

          <p className="mb-0">Welcome Back</p>
        </div>

        {/* Card Body */}

        <div className="card-body p-4">
          <h4
            className="fw-bold text-center mb-2"
            style={{
              color: "var(--text-h)",
            }}
          >
            Login to Your Account
          </h4>

          <p
            className="text-center mb-4"
            style={{
              color: "var(--text)",
            }}
          >
            Sign in to continue your journey.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Mobile Number */}

            <div className="mb-3">
              <label className="form-label fw-semibold">Mobile Number</label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-phone-fill"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Mobile Number"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={
                      showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"
                    }
                  ></i>
                </button>
              </div>
            </div>
            {/* Remember Me & Forgot Password */}

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />

                <label className="form-check-label" htmlFor="rememberMe">
                  Remember Me
                </label>
              </div>

              <Link
                to="/forgot-password"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  height: "52px",
                  fontSize: "17px",
                  fontWeight: "600",
                  borderRadius: "12px",
                }}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </button>
            </div>
          </form>

          {/* Success Message */}

          {msg && (
            <div className="alert alert-success mt-4 mb-0">
              <i className="bi bi-check-circle-fill me-2"></i>
              {msg}
            </div>
          )}

          {/* Error Message */}

          {error && (
            <div className="alert alert-danger mt-4 mb-0">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Divider */}

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />

            <span
              className="mx-3"
              style={{
                color: "#6B7280",
                fontWeight: "500",
              }}
            >
              OR
            </span>

            <hr className="flex-grow-1" />
          </div>

          {/* Register */}

          <div className="text-center">
            <span
              style={{
                color: "var(--text)",
              }}
            >
              Don't have an account?
            </span>

            <Link
              to="/register"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: "700",
                marginLeft: "8px",
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
