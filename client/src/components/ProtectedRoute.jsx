import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5 text-danger">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="alert alert-danger d-inline-block p-4 rounded-4 shadow">
          <i className="bi bi-shield-lock-fill fs-1 text-danger d-block mb-3"></i>
          <h4 className="alert-heading fw-bold">Administrator Access Required</h4>
          <p className="mb-3 text-secondary">
            You do not possess the required administrator credentials to view this area.
          </p>
          <a href="/" className="btn btn-outline-light rounded-pill px-4">
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
