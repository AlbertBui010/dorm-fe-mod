import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AlertCircle, UserPlus, Mail, Phone, Calendar, User, CreditCard } from 'lucide-react';
import registrationApi from '../services/api/registrationApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    hoTen: '',
    ngaySinh: '',
    gioiTinh: '',
    soDienThoai: '',
    maSinhVien: '',
    ngayNhanPhong: '',
    nguyenVong: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showExistingStudentModal, setShowExistingStudentModal] = useState(false);
  const [existingStudent, setExistingStudent] = useState(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState(null);
  const [isCalculatingDate, setIsCalculatingDate] = useState(false);

  // Tính toán ngày kết thúc hợp đồng khi thay đổi ngày nhận phòng
  const calculateEndDate = async (receiveDate) => {
    if (!receiveDate) {
      setCalculatedEndDate(null);
      return;
    }

    setIsCalculatingDate(true);
    try {
      const response = await registrationApi.calculateEndDate({ ngayNhanPhong: receiveDate });
      if (response.success) {
        setCalculatedEndDate(response.data);
      } else {
        setCalculatedEndDate(null);
        setErrors(prev => ({ ...prev, ngayNhanPhong: response.message }));
      }
    } catch (error) {
      console.error('Lỗi tính toán ngày kết thúc:', error);
      setCalculatedEndDate(null);
      setErrors(prev => ({ ...prev, ngayNhanPhong: 'Không thể tính toán ngày kết thúc' }));
    } finally {
      setIsCalculatingDate(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Tính toán ngày kết thúc khi thay đổi ngày nhận phòng
    if (name === 'ngayNhanPhong') {
      calculateEndDate(value);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Name validation
    if (!formData.hoTen) {
      newErrors.hoTen = 'Họ tên là bắt buộc';
    } else if (formData.hoTen.length < 2) {
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }
    
    // Phone validation (optional but if provided must be valid)
    if (formData.soDienThoai && !/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
    }
    
    // Student ID validation (required)
    if (!formData.maSinhVien) {
      newErrors.maSinhVien = 'Mã sinh viên là bắt buộc';
    } else if (!/^DH[0-9]{8}$/.test(formData.maSinhVien)) {
      newErrors.maSinhVien = 'Mã sinh viên phải có định dạng DH + 8 chữ số (VD: DH52107853)';
    }
    
    // Birth date validation (optional but if provided must be reasonable)
    if (formData.ngaySinh) {
      const birthDate = new Date(formData.ngaySinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 50) {
        newErrors.ngaySinh = 'Tuổi phải từ 16-50';
      }
    }
    
    // Student preferences validation
    if (formData.nguyenVong && formData.nguyenVong.length > 500) {
      newErrors.nguyenVong = 'Nguyện vọng không được vượt quá 500 ký tự';
    }

    // Receive date validation
    if (formData.ngayNhanPhong) {
      const receiveDate = new Date(formData.ngayNhanPhong);
      const today = new Date();
      const maxDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      if (receiveDate < today) {
        newErrors.ngayNhanPhong = 'Ngày nhận phòng không được trong quá khứ';
      } else if (receiveDate > maxDate) {
        newErrors.ngayNhanPhong = 'Ngày nhận phòng chỉ được chọn trong vòng 3 ngày';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await registrationApi.register(formData);
      
      // Registration successful
      navigate('/registration/check-email', {
        state: {
          email: formData.email,
          maSinhVien: result.data.maSinhVien,
          message: result.message
        }
      });
      
    } catch (error) {
      if (error.shouldLogin && error.existingStudent) {
        // Show existing student modal
        setExistingStudent(error.existingStudent);
        setShowExistingStudentModal(true);
      } else {
        // Show general error
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', {
      state: {
        email: existingStudent?.email || formData.email,
        message: 'Bạn đã có tài khoản. Vui lòng đăng nhập.'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Đăng ký ở Ký túc xá
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bước 1: Điền thông tin cơ bản
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="ml-2 text-sm font-medium text-blue-600">Đăng ký</span>
          </div>
          <div className="w-8 border-t border-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="ml-2 text-sm text-gray-500">Xác thực Email</span>
          </div>
          <div className="w-8 border-t border-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-sm text-gray-500">Thiết lập Mật khẩu</span>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nhập email của bạn"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="hoTen" className="block text-sm font-medium text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="hoTen"
                    name="hoTen"
                    type="text"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.hoTen ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>
                {errors.hoTen && <p className="mt-1 text-sm text-red-600">{errors.hoTen}</p>}
              </div>

              {/* Student ID (Required) */}
              <div>
                <label htmlFor="maSinhVien" className="block text-sm font-medium text-gray-700">
                  Mã sinh viên <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="maSinhVien"
                    name="maSinhVien"
                    type="text"
                    value={formData.maSinhVien}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.maSinhVien ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nhập mã sinh viên (VD: DH52107853)"
                  />
                </div>
                {errors.maSinhVien && <p className="mt-1 text-sm text-red-600">{errors.maSinhVien}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Định dạng: DH + 8 chữ số (VD: DH52107853)
                </p>
              </div>

              {/* Birth Date */}
              <div>
                <label htmlFor="ngaySinh" className="block text-sm font-medium text-gray-700">
                  Ngày sinh
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="ngaySinh"
                    name="ngaySinh"
                    type="date"
                    value={formData.ngaySinh}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.ngaySinh ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                {errors.ngaySinh && <p className="mt-1 text-sm text-red-600">{errors.ngaySinh}</p>}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gioiTinh" className="block text-sm font-medium text-gray-700">
                  Giới tính
                </label>
                <select
                  id="gioiTinh"
                  name="gioiTinh"
                  value={formData.gioiTinh}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="soDienThoai" className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="soDienThoai"
                    name="soDienThoai"
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.soDienThoai ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                {errors.soDienThoai && <p className="mt-1 text-sm text-red-600">{errors.soDienThoai}</p>}
              </div>

              {/* Receive Date */}
              <div>
                <label htmlFor="ngayNhanPhong" className="block text-sm font-medium text-gray-700">
                  Ngày nhận phòng
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="ngayNhanPhong"
                    name="ngayNhanPhong"
                    type="date"
                    value={formData.ngayNhanPhong}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.ngayNhanPhong ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                {errors.ngayNhanPhong && <p className="mt-1 text-sm text-red-600">{errors.ngayNhanPhong}</p>}
                {isCalculatingDate && (
                  <p className="mt-1 text-sm text-blue-600">Đang tính toán ngày tính tiền phòng...</p>
                )}
                {calculatedEndDate && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Ngày tính tiền phòng dự kiến:</strong> {calculatedEndDate.ngayTinhTienPhongDuKien || calculatedEndDate.ngayKetThucHopDong}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Việc đăng ký sẽ tính tiền phòng đến ngày này
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Chỉ được chọn trong vòng 3 ngày kể từ hôm nay
                </p>
              </div>

              {/* Student Preferences */}
              <div>
                <label htmlFor="nguyenVong" className="block text-sm font-medium text-gray-700">
                  Nguyện vọng
                </label>
                <div className="mt-1">
                  <textarea
                    id="nguyenVong"
                    name="nguyenVong"
                    value={formData.nguyenVong}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={500}
                    className={`block w-full px-3 py-2 border ${
                      errors.nguyenVong ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none`}
                    placeholder="Nhập nguyện vọng của bạn về loại phòng, khu vực ở, hoặc các yêu cầu đặc biệt khác (tối đa 500 ký tự)"
                  />
                </div>
                {errors.nguyenVong && <p className="mt-1 text-sm text-red-600">{errors.nguyenVong}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.nguyenVong.length}/500 ký tự
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Đăng ký'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Existing Student Modal */}
        {showExistingStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Thông tin đã tồn tại
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chúng tôi tìm thấy tài khoản với thông tin này:
                </p>
                {existingStudent && (
                  <div className="bg-gray-50 rounded-md p-4 mb-4 text-left">
                    <p><strong>Mã SV:</strong> {existingStudent.maSinhVien}</p>
                    <p><strong>Họ tên:</strong> {existingStudent.hoTen}</p>
                    <p><strong>Email:</strong> {existingStudent.email}</p>
                    <p><strong>Trạng thái:</strong> {existingStudent.emailDaXacThuc ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                  </div>
                )}
                <div className="flex space-x-4">
                  <Button
                    onClick={handleGoToLogin}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={() => setShowExistingStudentModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
