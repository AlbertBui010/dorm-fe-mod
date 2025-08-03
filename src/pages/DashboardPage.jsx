import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Settings,
  Users,
  Bed,
  CreditCard,
  Building,
  UserCheck,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  authService,
  roomService,
  bedService,
  studentService,
  employeeService,
} from "../services/api";
import paymentService from "../services/paymentService";

// Constants
const INITIAL_STATS = {
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
};

// Utility functions
const getOccupancyRate = (occupied, total) => {
  return total > 0 ? Math.round((occupied / total) * 100) : 0;
};

const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  const message = error?.message || defaultMessage;
  toast.error(message);
};

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(INITIAL_STATS);
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      const profileData = await authService.getProfile();
      setProfile(profileData.data);
    } catch (error) {
      handleApiError(error, "Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      // Use fallback data for failed API calls
      const [roomStats, bedStats, studentsResponse, paymentStats] = await Promise.all([
        roomService.getStatistics().catch((error) => {
          console.warn("Room stats failed:", error);
          return { data: { totalRooms: 0 } };
        }),
        bedService.getBedStatistics().catch((error) => {
          console.warn("Bed stats failed:", error);
          return { data: { TongSoGiuong: 0, SoGiuongDangO: 0, SoGiuongTrong: 0 } };
        }),
        studentService.getAll({ limit: 1 }).catch((error) => {
          console.warn("Student stats failed:", error);
          return { pagination: { total: 0 } };
        }),
        paymentService.getAdminStats().catch((error) => {
          console.warn("Payment stats failed:", error);
          return { 
            data: { 
              totals: { totalPayments: 0 }, 
              totalPending: 0, 
              totalPaid: 0, 
              totalOverdue: 0 
            } 
          };
        }),
      ]);

      // Load employee count (only for admin)
      let employeeCount = 0;
      if (user?.VaiTro === "QuanTriVien") {
        try {
          const employeesResponse = await employeeService.getAll({ limit: 1 });
          employeeCount = employeesResponse.pagination?.total || 0;
        } catch (error) {
          console.warn("Employee stats failed:", error);
        }
      }

      setStats({
        totalRooms: roomStats.data?.totalRooms || 0,
        totalBeds: bedStats.data?.TongSoGiuong || 0,
        occupiedBeds: bedStats.data?.SoGiuongDangO || 0,
        availableBeds: bedStats.data?.SoGiuongTrong || 0,
        totalStudents: studentsResponse.pagination?.total || 0,
        totalEmployees: employeeCount,
        totalPayments: paymentStats.data?.totals?.totalPayments || 0,
        pendingPayments: paymentStats.data?.totalPending || 0,
        completedPayments: paymentStats.data?.totalPaid || 0,
        overduePayments: paymentStats.data?.totalOverdue || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      setStats(INITIAL_STATS);
    }
  }, [user?.VaiTro]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, loadStats]);

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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Tổng quan hệ thống quản lý ký túc xá STU
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {String(profile?.HoTen || "Chưa có tên")}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.VaiTro === "QuanTriVien" ? "Quản trị viên" : "Nhân viên"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo("/profile")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Simplified Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phòng */}
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                <p className="text-2xl font-bold text-gray-900">{String(stats.totalRooms)}</p>
              </div>
            </div>
          </Card>

          {/* Giường */}
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bed className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng giường</p>
                <p className="text-2xl font-bold text-gray-900">{String(stats.totalBeds)}</p>
                <p className="text-xs text-gray-500">Trống: {String(stats.availableBeds)}</p>
              </div>
            </div>
          </Card>

          {/* Sinh viên */}
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sinh viên</p>
                <p className="text-2xl font-bold text-gray-900">{String(stats.totalStudents)}</p>
                <p className="text-xs text-gray-500">
                  Tỷ lệ: {String(getOccupancyRate(stats.occupiedBeds, stats.totalBeds))}%
                </p>
              </div>
            </div>
          </Card>

          {/* Thanh toán */}
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thanh toán</p>
                <p className="text-2xl font-bold text-gray-900">{String(stats.totalPayments)}</p>
                <p className="text-xs text-gray-500">
                  Hoàn thành: {String(stats.completedPayments)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Statistics - Admin Only */}
        {user?.VaiTro === "QuanTriVien" && (
          <>
            {/* Cơ sở vật chất chi tiết */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Chi tiết cơ sở vật chất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                    <UserCheck className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-600">Giường đã sử dụng</p>
                  <p className="text-2xl font-bold text-gray-900">{String(stats.occupiedBeds)}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-teal-100 rounded-full w-fit mx-auto mb-3">
                    <Bed className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-sm text-gray-600">Giường trống</p>
                  <p className="text-2xl font-bold text-gray-900">{String(stats.availableBeds)}</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-cyan-100 rounded-full w-fit mx-auto mb-3">
                    <User className="w-6 h-6 text-cyan-600" />
                  </div>
                  <p className="text-sm text-gray-600">Nhân viên</p>
                  <p className="text-2xl font-bold text-gray-900">{String(stats.totalEmployees)}</p>
                </div>
              </div>
            </div>

            {/* Tình trạng thanh toán chi tiết */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                Chi tiết thanh toán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600">{String(stats.pendingPayments)}</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Đã thanh toán</p>
                  <p className="text-2xl font-bold text-green-600">{String(stats.completedPayments)}</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-600">Quá hạn</p>
                  <p className="text-2xl font-bold text-red-600">{String(stats.overduePayments)}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => navigateTo("/rooms")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Building className="w-6 h-6" />
              <span className="text-sm">Quản lý phòng</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateTo("/students")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Sinh viên</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateTo("/payments")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Thanh toán</span>
            </Button>
            {user?.VaiTro === "QuanTriVien" && (
              <Button
                variant="outline"
                onClick={() => navigateTo("/employees")}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <User className="w-6 h-6" />
                <span className="text-sm">Nhân viên</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
