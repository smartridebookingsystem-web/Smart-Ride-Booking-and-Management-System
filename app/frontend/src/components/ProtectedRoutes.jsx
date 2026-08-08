import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const normalizeRole = (r) => {
  if (r === undefined || r === null) return null;
  if (typeof r === "object") {
    r = r.role_value || r.roleValue || r.roleName || r.role || r.name || r.id;
  }
  const str = String(r).toLowerCase().trim();
  if (str === "1" || str === "admin" || str === "role_admin") return 1;
  if (str === "2" || str === "driver" || str === "role_driver") return 2;
  if (str === "3" || str === "rider" || str === "role_rider") return 3;
  return Number(r) || r;
};

export default function ProtectedRoutes({ children, role }) {
  const loginstate = useSelector(state => state.auth);

  if (!loginstate.isAuthenticated || !loginstate.user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== undefined && role !== null) {
    const requiredRole = normalizeRole(role);
    const userRole = normalizeRole(
      loginstate.user.role !== undefined ? loginstate.user.role :
        loginstate.user.role_id !== undefined ? loginstate.user.role_id :
          loginstate.user.roleName !== undefined ? loginstate.user.roleName :
            loginstate.user.role_value
    );

    if (requiredRole !== userRole) {
      if (userRole === 1) return <Navigate to="/admin" replace />;
      if (userRole === 2) return <Navigate to="/driver" replace />;
      if (userRole === 3) return <Navigate to="/rider" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}