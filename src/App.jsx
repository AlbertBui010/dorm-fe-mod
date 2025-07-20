import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ApiTestPage from "./pages/ApiTestPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import BedManagementPage from "./pages/BedManagementPage";
import StudentManagementPage from "./pages/StudentManagementPage";
import DonGiaDienNuocManagementPage from "./pages/DonGiaDienNuocManagementPage";
import ElectricWaterIndexManagementPage from "./pages/ElectricWaterIndexManagementPage";
import YeuCauChuyenPhongManagementPage from "./pages/YeuCauChuyenPhongManagementPage";
import StudentYeuCauChuyenPhongPage from "./pages/StudentYeuCauChuyenPhongPage";
import LichSuOPhongManagementPage from "./pages/LichSuOPhongManagementPage";

import RegisterPage from "./pages/RegisterPage";
import CheckEmailPage from "./pages/CheckEmailPage";
import SetupPasswordPage from "./pages/SetupPasswordPage";
import RegistrationCompletePage from "./pages/RegistrationCompletePage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentPaymentPage from "./pages/StudentPaymentPage";
import RegistrationApprovalPage from "./pages/RegistrationApprovalPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Auto redirect handler for PayOS return URLs
function PaymentReturnRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status === "PAID") {
      navigate("/payments/success" + location.search, { replace: true });
    } else if (status === "CANCELLED") {
      navigate("/payments/cancelled" + location.search, { replace: true });
    } else {
      navigate("/payments/failed" + location.search, { replace: true });
    }
  }, [location, navigate]);
  return null;
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return children;

  // Nếu đã đăng nhập, kiểm tra loại user để redirect đúng trang
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    // Nếu là sinh viên (có MaSinhVien) -> chuyển đến student dashboard
    if (userData.MaSinhVien) {
      return <Navigate to="/student/dashboard" />;
    }
    // Nếu là admin/nhân viên -> chuyển đến admin dashboard
    return <Navigate to="/dashboard" />;
  }

  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              theme: {
                primary: "green",
                secondary: "black",
              },
            },
          }}
        />

        <Routes>
          {/* Payment Result Pages (PayOS redirect) */}
          <Route path="/payments/success" element={<PaymentSuccessPage />} />
          <Route
            path="/payments/cancelled"
            element={<PaymentCancelledPage />}
          />
          <Route path="/payments/failed" element={<PaymentFailedPage />} />
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* UC7: Student Registration Routes (Public) */}
          <Route
            path="/registration/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/registration/check-email"
            element={
              <PublicRoute>
                <CheckEmailPage />
              </PublicRoute>
            }
          />

          <Route
            path="/registration/setup-password"
            element={
              <PublicRoute>
                <SetupPasswordPage />
              </PublicRoute>
            }
          />

          <Route
            path="/registration/complete"
            element={
              <PublicRoute>
                <RegistrationCompletePage />
              </PublicRoute>
            }
          />

          {/* Alternative route names for email verification */}
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <CheckEmailPage />
              </PublicRoute>
            }
          />

          <Route
            path="/setup-password"
            element={
              <PublicRoute>
                <SetupPasswordPage />
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

          {/* Student Dashboard Route */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Student Payment Route */}
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute>
                <StudentPaymentPage />
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

          <Route
            path="/don-gia-dien-nuoc"
            element={
              <ProtectedRoute>
                <DonGiaDienNuocManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chi-so-dien-nuoc"
            element={
              <ProtectedRoute>
                <ElectricWaterIndexManagementPage />
              </ProtectedRoute>
            }
          />

          {/* UC8: Registration Approval Page */}
          <Route
            path="/registration-approval"
            element={
              <ProtectedRoute>
                <RegistrationApprovalPage />
              </ProtectedRoute>
            }
          />

          {/* UC: Yêu cầu chuyển phòng - Admin */}
          <Route
            path="/yeu-cau-chuyen-phong"
            element={
              <ProtectedRoute>
                <YeuCauChuyenPhongManagementPage />
              </ProtectedRoute>
            }
          />

          {/* UC: Yêu cầu chuyển phòng - Student */}
          <Route
            path="/student/yeu-cau-chuyen-phong"
            element={
              <ProtectedRoute>
                <StudentYeuCauChuyenPhongPage />
              </ProtectedRoute>
            }
          />

          {/* UC10: Payment Management Page */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* UC11: Lịch sử ở phòng */}
          <Route
            path="/lich-su-o-phong"
            element={
              <ProtectedRoute>
                <LichSuOPhongManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to appropriate dashboard or register page */}
          <Route
            path="/"
            element={(() => {
              const token = localStorage.getItem("token");
              if (!token) {
                return <Navigate to="/registration/register" />;
              }

              const user = localStorage.getItem("user");
              if (user) {
                const userData = JSON.parse(user);
                if (userData.MaSinhVien) {
                  return <Navigate to="/student/dashboard" />;
                }
              }
              return <Navigate to="/dashboard" />;
            })()}
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
