import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Settings,
  LogOut,
  Users,
  Home,
  Bed,
  CreditCard,
  Building,
  UserCheck,
  AlertCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import YeuCauChuyenPhongStatsCard from "../components/YeuCauChuyenPhongStatsCard";
import {
  authService,
  roomService,
  bedService,
  studentService,
  employeeService,
} from "../services/api";
import paymentService from "../services/paymentService";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    totalStudents: 0,
    totalEmployees: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    overduePayments: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      const profileData = await authService.getProfile();
      setProfile(profileData.data);
    } catch (error) {
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load room statistics
      const roomStats = await roomService.getStatistics();

      // Load bed statistics
      const bedStats = await bedService.getBedStatistics();

      // Load student count
      const studentsResponse = await studentService.getAllStudents({
        limit: 1,
      });

      // Load employee count (only for admin)
      let employeeCount = 0;
      if (user?.VaiTro === "QuanTriVien") {
        const employeesResponse = await employeeService.getAllEmployees({
          limit: 1,
        });
        employeeCount = employeesResponse.pagination?.totalItems || 0;
      }

      // Load payment statistics
      const paymentStats = await paymentService.getAdminStats();

      setStats({
        totalRooms: roomStats.data?.totalRooms || 0,
        totalBeds: bedStats.data?.TongSoGiuong || 0,
        occupiedBeds: bedStats.data?.SoGiuongDangO || 0,
        availableBeds: bedStats.data?.SoGiuongTrong || 0,
        totalStudents: studentsResponse.pagination?.totalItems || 0,
        totalEmployees: employeeCount,
        totalPayments: paymentStats.data?.totals?.totalPayments || 0,
        pendingPayments: paymentStats.data?.totalPending || 0,
        completedPayments: paymentStats.data?.totalPaid || 0,
        overduePayments: paymentStats.data?.totalOverdue || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      // Set default values if API fails
      setStats({
        totalRooms: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        totalStudents: 0,
        totalEmployees: 0,
        totalPayments: 0,
        pendingPayments: 0,
        completedPayments: 0,
        overduePayments: 0,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Tổng quan hệ thống quản lý ký túc xá
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="space-y-6">
          {/* Cơ sở vật chất */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Cơ sở vật chất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng phòng
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalRooms}
                    </p>
                    <p className="text-xs text-gray-500">
                      Phòng trong ký túc xá
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng giường
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalBeds}
                    </p>
                    <p className="text-xs text-gray-500">Giường có sẵn</p>
                  </div>
                  <Bed className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đã sử dụng
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.occupiedBeds}
                    </p>
                    <p className="text-xs text-gray-500">Giường có sinh viên</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-orange-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Giường trống
                    </p>
                    <p className="text-2xl font-bold text-teal-600">
                      {stats.availableBeds}
                    </p>
                    <p className="text-xs text-gray-500">Có thể đăng ký</p>
                  </div>
                  <Bed className="w-8 h-8 text-teal-500" />
                </div>
              </Card>
            </div>
          </div>

          {/* Tỷ lệ sử dụng */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Hiệu quả sử dụng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tỷ lệ sử dụng
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalBeds > 0
                        ? Math.round(
                            (stats.occupiedBeds / stats.totalBeds) * 100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-gray-500">Tổng thể ký túc xá</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng sinh viên
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {stats.totalStudents}
                    </p>
                    <p className="text-xs text-gray-500">Sinh viên đang ở</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-500" />
                </div>
              </Card>

              {user?.VaiTro === "QuanTriVien" && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tổng nhân viên
                      </p>
                      <p className="text-2xl font-bold text-cyan-600">
                        {stats.totalEmployees}
                      </p>
                      <p className="text-xs text-gray-500">
                        Nhân viên hệ thống
                      </p>
                    </div>
                    <User className="w-8 h-8 text-cyan-500" />
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Tình trạng thanh toán */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
              Tình trạng thanh toán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng thanh toán
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.totalPayments}
                    </p>
                    <p className="text-xs text-gray-500">Giao dịch đã tạo</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-emerald-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Hoàn thành
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.completedPayments}
                    </p>
                    <p className="text-xs text-gray-500">
                      Thanh toán thành công
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Chờ xử lý
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pendingPayments}
                    </p>
                    <p className="text-xs text-gray-500">Thanh toán đang chờ</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.overduePayments}
                    </p>
                    <p className="text-xs text-gray-500">Cần xử lý gấp</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-500" />
                </div>
              </Card>
            </div>
          </div>

          {/* Yêu cầu chuyển phòng */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Yêu cầu chuyển phòng
            </h2>
            <YeuCauChuyenPhongStatsCard />
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card title="Thông tin cá nhân">
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.HoTen || "Chưa có tên"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.VaiTro || "SinhVien"}
                    </p>
                  </div>
                </div>

                {profile?.Email && (
                  <div className="text-sm text-gray-600">
                    Email: {profile.Email}
                  </div>
                )}

                {profile?.MaSinhVien && (
                  <div className="text-sm text-gray-600">
                    Mã SV: {profile.MaSinhVien}
                  </div>
                )}

                {profile?.SoDienThoai && (
                  <div className="text-sm text-gray-600">
                    SĐT: {profile.SoDienThoai}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo("/profile")}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt tài khoản
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
