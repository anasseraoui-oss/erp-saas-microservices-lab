import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
    const hasToken = () => {
        const token = localStorage.getItem('token');
        return token !== null;
    };

    const isAuthenticated = hasToken();
    return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;