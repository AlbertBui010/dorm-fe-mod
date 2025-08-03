import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Users,
  Bed,
  CreditCard,
  Building,
  UserCheck,
  MapPin,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Home,
  Settings,
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
  // Room stats
  totalRooms: 0,
  emptyRooms: 0,
  fullRooms: 0,
  
  // Bed stats
  totalBeds: 0,
  occupiedBeds: 0,
  availableBeds: 0,
  occupancyRate: 0,
  
  // Student & Employee stats
  totalStudents: 0,
  totalEmployees: 0,
  
  // Payment stats
  totalPayments: 0,
  pendingPayments: 0,
  completedPayments: 0,
  overduePayments: 0,
  totalRevenue: 0,
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
      console.error("Error loading profile:", error);
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      // Load all statistics in parallel
      const [
        roomsResponse,
        bedStats,
        studentsResponse,
        employeesResponse,
        paymentStats
      ] = await Promise.all([
        roomService.getAll({ limit: 1000 }).catch(() => ({ data: [], pagination: { total: 0 } })),
        bedService.getBedStatistics().catch(() => ({ data: { TongSoGiuong: 0, SoGiuongDangO: 0, SoGiuongTrong: 0 } })),
        studentService.getAll({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
        user?.VaiTro === "QuanTriVien" 
          ? employeeService.getAll({ limit: 1 }).catch(() => ({ pagination: { total: 0 } }))
          : Promise.resolve({ pagination: { total: 0 } }),
        paymentService.getAdminStats().catch(() => ({ 
          data: { 
            totals: { totalPayments: 0 }, 
            totalPending: 0, 
            totalPaid: 0, 
            totalOverdue: 0 
          } 
        })),
      ]);

      // Process room statistics
      const rooms = roomsResponse.data || [];
      const totalRooms = roomsResponse.pagination?.total || 0;
      
      const emptyRooms = rooms.filter((r) => {
        const occupiedBeds = r.Giuongs
          ? r.Giuongs.filter((g) => g.DaCoNguoi).length
          : r?.SoLuongHienTai || 0;
        return occupiedBeds === 0 && (r?.TrangThai || "Hoạt động") === "Hoạt động";
      }).length;

      const fullRooms = rooms.filter((r) => {
        const occupiedBeds = r.Giuongs
          ? r.Giuongs.filter((g) => g.DaCoNguoi).length
          : r?.SoLuongHienTai || 0;
        const maxBeds = r?.SucChua || (r.Giuongs ? r.Giuongs.length : 0);
        return occupiedBeds === maxBeds && maxBeds > 0;
      }).length;

      // Process bed statistics
      const totalBeds = bedStats.data?.TongSoGiuong || 0;
      const occupiedBeds = bedStats.data?.SoGiuongDangO || 0;
      const availableBeds = bedStats.data?.SoGiuongTrong || 0;
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      // Process payment statistics
      const totalPayments = paymentStats.data?.totals?.totalPayments || 0;
      const pendingPayments = paymentStats.data?.totalPending || 0;
      const completedPayments = paymentStats.data?.totalPaid || 0;
      const overduePayments = paymentStats.data?.totalOverdue || 0;

      setStats({
        // Room stats
        totalRooms,
        emptyRooms,
        fullRooms,
        
        // Bed stats
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        
        // Student & Employee stats
        totalStudents: studentsResponse.pagination?.total || 0,
        totalEmployees: employeesResponse.pagination?.total || 0,
        
        // Payment stats
        totalPayments,
        pendingPayments,
        completedPayments,
        overduePayments,
        totalRevenue: paymentStats.data?.totals?.totalRevenue || 0,
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
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Home className="w-6 h-6 mr-2 text-blue-600" />
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Tổng quan hệ thống quản lý ký túc xá STU
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.HoTen || "Chưa có tên"}
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
        </Card>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Rooms */}
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateTo("/rooms")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                <p className="text-xs text-gray-500">
                  Trống: {stats.emptyRooms} | Đầy: {stats.fullRooms}
                </p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          {/* Total Beds */}
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateTo("/beds")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giường</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalBeds}</p>
                <p className="text-xs text-gray-500">
                  Trống: {stats.availableBeds} | Đã có người: {stats.occupiedBeds}
                </p>
              </div>
              <Bed className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          {/* Total Students */}
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateTo("/students")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sinh viên</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalStudents}</p>
                <p className="text-xs text-gray-500">
                  Tỷ lệ sử dụng: {stats.occupancyRate}%
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          {/* Total Payments */}
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateTo("/payments")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thanh toán</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalPayments}</p>
                <p className="text-xs text-gray-500">
                  Hoàn thành: {stats.completedPayments}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-emerald-500" />
            </div>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room & Bed Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Chi tiết cơ sở vật chất
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Phòng trống</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.emptyRooms}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Phòng đầy</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.fullRooms}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Tỷ lệ sử dụng giường</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats.occupancyRate}%</span>
              </div>

              {user?.VaiTro === "QuanTriVien" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-cyan-500 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Nhân viên</span>
                  </div>
                  <span className="text-lg font-bold text-cyan-600">{stats.totalEmployees}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
              Chi tiết thanh toán
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Chờ xử lý</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.pendingPayments}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Đã thanh toán</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.completedPayments}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Quá hạn</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.overduePayments}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Tổng doanh thu</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => navigateTo("/rooms")}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Building className="w-6 h-6 mb-2" />
              <span className="text-sm">Quản lý phòng</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigateTo("/beds")}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Bed className="w-6 h-6 mb-2" />
              <span className="text-sm">Quản lý giường</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigateTo("/students")}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Quản lý sinh viên</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigateTo("/payments")}
              className="flex flex-col items-center p-4 h-auto"
            >
              <CreditCard className="w-6 h-6 mb-2" />
              <span className="text-sm">Quản lý thanh toán</span>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;
