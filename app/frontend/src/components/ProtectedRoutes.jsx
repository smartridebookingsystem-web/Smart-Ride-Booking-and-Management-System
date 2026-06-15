import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoutes({ children, role }) 
{    //user,token,role,isAuthenticated
    const loginstate = useSelector(state => state.auth);
  //any user has logged in or not  
if(!loginstate.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if(role && role !== loginstate.user?.role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}