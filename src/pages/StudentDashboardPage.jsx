import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationStatusCard from '../components/RegistrationStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, LogOut, AlertTriangle, Mail, Phone, CreditCard } from 'lucide-react';
import { authService } from '../services/api/authService';

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setError('');
      const result = await authService.getProfile();
      console.log('Profile data:', result.data);
      setProfile(result.data);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('token') || err.message.includes('Unauthorized')) {
        // Token expired or invalid
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API call fails
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="space-x-3">
              <Button onClick={fetchProfile} variant="outline">
                Thử lại
              </Button>
              <Button onClick={() => navigate('/login')} variant="primary">
                Đăng nhập lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/logo/logo-stu.png" 
                alt="STU Logo" 
                className="h-12 w-12 mr-4"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Ký túc xá STU - Trang cá nhân sinh viên
                </h1>
                <p className="text-sm text-gray-500">
                  Xin chào, {profile?.HoTen}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Student Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin sinh viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã sinh viên</label>
                  <p className="text-lg font-semibold text-gray-900">{profile?.MaSinhVien}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                  <p className="text-lg font-semibold text-gray-900">{profile?.HoTen}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {profile?.Email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    {profile?.SoDienThoai || 'Chưa có'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                  <p className="text-gray-900">
                    {profile?.NgaySinh ? new Date(profile.NgaySinh).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Giới tính</label>
                  <p className="text-gray-900">{profile?.GioiTinh || 'Chưa có'}</p>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Các tính năng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/student/payments')}
                  variant="outline"
                  className="flex items-center justify-center p-6 h-auto"
                >
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Thanh toán</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Xem và thanh toán các khoản phí ký túc xá
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
