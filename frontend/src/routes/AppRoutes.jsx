import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

// Lazy load pages
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Exams = lazy(() => import('../pages/Exams'));
const Results = lazy(() => import('../pages/Results'));
const Profile = lazy(() => import('../pages/Profile'));
const Timetable = lazy(() => import('../pages/Timetable'));
const Books = lazy(() => import('../pages/Books'));
const QuestionBank = lazy(() => import('../pages/QuestionBank'));
const Semesters = lazy(() => import('../pages/Semesters'));

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

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
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="semesters" element={<Semesters />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exams/timetable" element={<Timetable />} />
          <Route path="exams/semester" element={<Exams type="Semester" />} />
          <Route path="exams/arrear" element={<Exams type="Arrear" />} />
          
          <Route path="results" element={<Results />} />
          <Route path="results/semester" element={<Results type="Semester" />} />
          <Route path="results/arrear" element={<Results type="Arrear" />} />
          
          <Route path="books" element={<Books />} />
          <Route path="question-bank" element={<QuestionBank />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
