import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const PrivateRoutes = ({ allowedRoles }) => {
  const { user, isCheckingAuth } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const hasValidToken = !!token && token !== 'undefined' && token !== 'null';

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (!user || !hasValidToken) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === 'PROFESSOR'
        ? '/professor/dashboard'
        : user.role === 'ADMINISTRADOR'
          ? '/admin/dashboard'
          : '/secretaria/dashboard';

    return <Navigate to={fallback} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
