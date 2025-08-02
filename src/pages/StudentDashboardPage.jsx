import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RegistrationStatusCard from "../components/RegistrationStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui";
import Button from "../components/ui/Button";
import {
  Mail,
  Phone,
  CreditCard,
  Home,
  AlertTriangle,
  ArrowRightLeft,
  Key,
} from "lucide-react";
import { authService } from "../services/api/authService";
import { studentPaymentService } from "../services/api/studentPaymentService";
import Layout from "../components/Layout";
import ChangePasswordModal from "../components/ChangePasswordModal";

const getStudentNavigation = (stats) => {
  return [
    { name: "Dashboard", href: "/student/dashboard", icon: Home, show: true },
    {
      name: "Thanh toán",
      href: "/student/payments",
      icon: CreditCard,
      show: true,
      badge: stats && stats.totalPending > 0 ? stats.totalPending : null,
    },
    {
      name: "Yêu cầu chuyển phòng",
      href: "/student/yeu-cau-chuyen-phong",
      icon: ArrowRightLeft,
      show: true,
    },
  ];
};

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStats, setPaymentStats] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setError("");
      const result = await authService.getProfile();
      setProfile(result.data);
      // Lấy thống kê thanh toán để hiện badge
      const statsResult = await studentPaymentService.getPaymentStats();
      setPaymentStats(statsResult.data);
    } catch (err) {
      setError(err.message);
      if (
        err.message.includes("token") ||
        err.message.includes("Unauthorized")
      ) {
        // Token expired or invalid
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <Layout navigation={getStudentNavigation(paymentStats)}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Đang tải thông tin...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Có lỗi xảy ra
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="space-x-3">
              <Button onClick={fetchProfile} variant="outline">
                Thử lại
              </Button>
              <Button onClick={() => navigate("/login")} variant="primary">
                Đăng nhập lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout navigation={getStudentNavigation(paymentStats)}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Student Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin sinh viên</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Key className="h-4 w-4 mr-1" />
                  Đổi mật khẩu
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mã sinh viên
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile?.MaSinhVien}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Họ và tên
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile?.HoTen}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {profile?.Email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Số điện thoại
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {profile?.SoDienThoai || "Chưa có"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày sinh
                  </label>
                  <p className="text-gray-900">
                    {profile?.NgaySinh
                      ? new Date(profile.NgaySinh).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Giới tính
                  </label>
                  <p className="text-gray-900">
                    {profile?.GioiTinh || "Chưa có"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Registration Status - Reuse existing component */}
          <RegistrationStatusCard
            maSinhVien={profile?.MaSinhVien}
            profileData={profile}
            showActions={false}
          />
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          studentInfo={profile}
        />
      </div>
    </Layout>
  );
};

export default StudentDashboardPage;
