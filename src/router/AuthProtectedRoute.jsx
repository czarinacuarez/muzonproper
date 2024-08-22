import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../context/AuthContext';

const AuthProtectedRoute = () => {
  const { user } = useUser();

  
  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AuthProtectedRoute;
