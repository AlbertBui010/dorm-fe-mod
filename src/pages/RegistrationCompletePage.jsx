import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CheckCircle, User, Clock, AlertTriangle, Home, LogIn } from 'lucide-react';

const RegistrationCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentInfo, setStudentInfo] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const stateData = location.state;
    
    if (!stateData) {
      // If no state data, redirect to register
      navigate('/registration/register');
      return;
    }

    setIsSuccess(stateData.success || false);
    setMessage(stateData.message || '');
    setStudentInfo(stateData.studentInfo || {});
  }, [location.state, navigate]);

  const handleGoToLogin = () => {
    navigate('/login', {
      state: {
        maSinhVien: studentInfo.maSinhVien,
        message: 'Bạn có thể đăng nhập bằng mã sinh viên và mật khẩu đã thiết lập.'
      }
    });
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  if (!isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Có lỗi xảy ra
              </h2>
              <p className="text-gray-600 mb-4">
                Không thể hoàn tất quy trình đăng ký. Vui lòng thử lại.
              </p>
              <Button
                onClick={() => navigate('/registration/register')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Đăng ký lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Đăng ký thành công!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chúc mừng bạn đã hoàn tất quy trình đăng ký
          </p>
        </div>

        {/* Progress indicator - All completed */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Đăng ký</span>
          </div>
          <div className="w-8 border-t-2 border-green-600"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Xác thực Email</span>
          </div>
          <div className="w-8 border-t-2 border-green-600"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Mật khẩu</span>
          </div>
        </div>

        {/* Success Card */}
        <Card className="mt-8">
          <CardContent className="p-6">
            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm text-green-800 font-medium">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Information */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">Thông tin tài khoản</h3>
              </div>
              <div className="space-y-3">
                {studentInfo.maSinhVien && (
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Mã sinh viên:</span>
                    <span className="text-sm font-medium text-blue-900">{studentInfo.maSinhVien}</span>
                  </div>
                )}
                {studentInfo.hoTen && (
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Họ tên:</span>
                    <span className="text-sm font-medium text-blue-900">{studentInfo.hoTen}</span>
                  </div>
                )}
                {studentInfo.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Email:</span>
                    <span className="text-sm font-medium text-blue-900">{studentInfo.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Trạng thái:</span>
                  <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                    Chờ duyệt
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    Các bước tiếp theo
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Đăng ký của bạn đang trong trạng thái <strong>"CHỜ DUYỆT"</strong></li>
                    <li>• Phòng Quản lý Ký túc xá sẽ xem xét và phê duyệt đăng ký</li>
                    <li>• Bạn sẽ nhận được email thông báo kết quả trong 2-3 ngày làm việc</li>
                    <li>• Nếu được duyệt, bạn sẽ được hướng dẫn làm thủ tục nhận phòng</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                📝 Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vui lòng lưu lại thông tin mã sinh viên và mật khẩu</li>
                <li>• Bạn có thể đăng nhập để theo dõi tình trạng đăng ký</li>
                <li>• Kiểm tra email thường xuyên để nhận thông báo cập nhật</li>
                <li>• Liên hệ Phòng Quản lý nếu có thắc mắc</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Đăng nhập vào hệ thống
              </Button>
              
              <Button
                onClick={handleGoToHome}
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </div>

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                📞 Thông tin liên hệ
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Phòng Quản lý Ký túc xá</strong></p>
                <p>Trường Đại học Sư phạm Kỹ thuật TP.HCM</p>
                <p>📧 Email: ktx@stu.edu.vn</p>
                <p>☎️ Hotline: (028) 3896 1234</p>
                <p>🏠 Địa chỉ: 1 Võ Văn Ngân, Thủ Đức, TP.HCM</p>
                <p className="text-xs text-gray-500 mt-2">
                  Giờ làm việc: 8:00 - 17:00 (Thứ 2 - Thứ 6)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Cảm ơn bạn đã tin tưởng và lựa chọn ký túc xá STU! 🏠
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationCompletePage;
