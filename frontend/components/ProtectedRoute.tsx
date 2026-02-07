
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Redirect them to the /auth/sign-in page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
