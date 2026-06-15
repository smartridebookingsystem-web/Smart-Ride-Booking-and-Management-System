import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice.js';
import { useNavigate } from 'react-router-dom';
export default function Logout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
    dispatch(logout());
    navigate("/");
    }, [dispatch, navigate]);
    return null;
}