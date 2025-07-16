import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Settings, LogOut, Users, Home } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { authService } from '../services/api';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      const profileData = await authService.getProfile();
      setProfile(profileData.data);
    } catch (error) {
      toast.error('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
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
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card title="Thông tin cá nhân">
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.HoTen || 'Chưa có tên'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.VaiTro || 'SinhVien'}
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
                  onClick={() => navigateTo('/profile')}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt tài khoản
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card title="Chức năng nhanh">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Features */}
                {user?.VaiTro !== 'SinhVien' && (
                  <>
                    <div 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigateTo('/employees')}
                    >
                      <Users className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Quản lý Nhân viên</h3>
                      <p className="text-sm text-gray-600">Xem và quản lý danh sách nhân viên</p>
                    </div>
                    
                    <div 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigateTo('/sinh-vien')}
                    >
                      <Users className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Quản lý Sinh viên</h3>
                      <p className="text-sm text-gray-600">Xem và quản lý danh sách sinh viên</p>
                    </div>
                    
                    <div 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigateTo('/rooms')}
                    >
                      <Home className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Quản lý Phòng</h3>
                      <p className="text-sm text-gray-600">Xem và quản lý danh sách phòng</p>
                    </div>
                  </>
                )}

                {/* Student Features */}
                {user?.VaiTro === 'SinhVien' && (
                  <>
                    <div 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigateTo('/my-room')}
                    >
                      <Home className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Phòng của tôi</h3>
                      <p className="text-sm text-gray-600">Xem thông tin phòng hiện tại</p>
                    </div>
                    
                    <div 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigateTo('/payments')}
                    >
                      <Settings className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Thanh toán</h3>
                      <p className="text-sm text-gray-600">Xem lịch sử thanh toán</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Stats */}
            <div className="mt-6">
              <Card title="Thống kê nhanh">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">--</div>
                    <div className="text-sm text-gray-600">Sinh viên</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">--</div>
                    <div className="text-sm text-gray-600">Phòng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">--</div>
                    <div className="text-sm text-gray-600">Đăng ký</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">--</div>
                    <div className="text-sm text-gray-600">Chờ duyệt</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
