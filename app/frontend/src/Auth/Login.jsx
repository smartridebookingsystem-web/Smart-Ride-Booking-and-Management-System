import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../components/services/api.js";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const r = authState.user.role || authState.user.roleName;
      const userRole = (r === 1 || r === "1" || r === "admin" || r === "ADMIN") ? 1
                     : (r === 2 || r === "2" || r === "driver" || r === "DRIVER") ? 2 : 3;

      if (userRole === 1) navigate("/admin", { replace: true });
      else if (userRole === 2) navigate("/driver", { replace: true });
      else navigate("/rider", { replace: true });
    }
  }, [authState, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMsg("");
    setIsLoading(true);

    try {
      const data = await authApi.login(username, password);

      // Determine role mapping (1=admin, 2=driver, 3=rider)
      const roleStr = (data.role || "").toLowerCase();
      let roleNum = 3;
      if (roleStr === "admin" || roleStr === "1") roleNum = 1;
      else if (roleStr === "driver" || roleStr === "2") roleNum = 2;
      else if (roleStr === "rider" || roleStr === "3") roleNum = 3;

      const userPayload = {
        id: data.userId,
        username: data.username,
        email: data.email,
        phone: data.phone || data.username,
        role: roleNum,
        roleName: data.role,
      };

      dispatch(
        login({
          user: userPayload,
          token: data.token,
        })
      );

      setMsg("Login Successful! Redirecting...");

      setTimeout(() => {
        if (roleNum === 1) {
          navigate("/admin");
        } else if (roleNum === 2) {
          navigate("/driver");
        } else {
          navigate("/rider");
        }
      }, 500);
    } catch (err) {
      setError(err.message || "Unable to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center py-5">
      <div
        className="card border-0 shadow-lg"
        style={{
          maxWidth: "500px",
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
        <div className="card-body p-4 p-md-5">
          <h4
            className="fw-bold text-center mb-2"
            style={{
              color: "var(--text-h)",
            }}
          >
            Login to Your Account
          </h4>

          <p
            className="text-center mb-4 text-secondary"
          >
            Sign in using your Mobile Number to continue.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Mobile Number / Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                Mobile Number
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-phone-fill"></i>
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
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
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="form-control"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  name="rememberMe"
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
                disabled={isLoading}
                style={{
                  height: "52px",
                  fontSize: "17px",
                  fontWeight: "600",
                  borderRadius: "12px",
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </>
                )}
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
