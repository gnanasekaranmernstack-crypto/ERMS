import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Exams from '../pages/Exams';
import Results from '../pages/Results';
import Profile from '../pages/Profile';
import Timetable from '../pages/Timetable';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exams/timetable" element={<Timetable />} />
        <Route path="exams/semester" element={<Exams type="Semester" />} />
        <Route path="exams/arrear" element={<Exams type="Arrear" />} />
        
        <Route path="results" element={<Results />} />
        <Route path="results/semester" element={<Results type="Semester" />} />
        <Route path="results/arrear" element={<Results type="Arrear" />} />
        
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
