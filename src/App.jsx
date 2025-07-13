import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApiTestPage from './pages/ApiTestPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import RoomManagementPage from './pages/RoomManagementPage';
import BedManagementPage from './pages/BedManagementPage';
import StudentManagementPage from './pages/StudentManagementPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/api-test" 
            element={
              <ProtectedRoute>
                <ApiTestPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute>
                <EmployeeManagementPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rooms" 
            element={
              <ProtectedRoute>
                <RoomManagementPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/beds" 
            element={
              <ProtectedRoute>
                <BedManagementPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/students" 
            element={
              <ProtectedRoute>
                <StudentManagementPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to dashboard or login */}
          <Route 
            path="/" 
            element={
              localStorage.getItem('token') 
                ? <Navigate to="/dashboard" /> 
                : <Navigate to="/login" />
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
