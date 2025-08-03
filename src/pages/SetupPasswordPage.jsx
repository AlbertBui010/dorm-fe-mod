import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import registrationApi from '../services/api/registrationApi';

const SetupPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    maSinhVien: '',
    matKhau: '',
    xacNhanMatKhau: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get data from navigation state or URL params
    const stateData = location.state;
    const maSinhVienFromUrl = searchParams.get('maSinhVien');
    const verifiedFromUrl = searchParams.get('verified');
    
    if (stateData) {
      setFormData(prev => ({
        ...prev,
        maSinhVien: stateData.maSinhVien || ''
      }));
      setStudentInfo({
        hoTen: stateData.hoTen || '',
        email: stateData.email || ''
      });
      setMessage(stateData.message || '');
    }

    if (maSinhVienFromUrl) {
      setFormData(prev => ({
        ...prev,
        maSinhVien: maSinhVienFromUrl
      }));
    }

    if (verifiedFromUrl === 'true') {
      setMessage('Email đã được xác thực thành công! Vui lòng thiết lập mật khẩu.');
    }

    // If no student ID, redirect back
    if (!stateData?.maSinhVien && !maSinhVienFromUrl) {
      navigate('/registration/register', {
        state: {
          message: 'Vui lòng hoàn tất quy trình đăng ký từ đầu.'
        }
      });
    }
  }, [location.state, searchParams, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Ít nhất 6 ký tự');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Ít nhất 1 chữ cái');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Ít nhất 1 chữ số');
    }
    
    return errors;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    
    // Length
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    
    // Contains letter
    if (/[a-zA-Z]/.test(password)) score += 1;
    
    // Contains number
    if (/\d/.test(password)) score += 1;
    
    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    // Contains mix of upper and lower case
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    
    if (score <= 2) return { strength: 1, label: 'Yếu', color: 'bg-red-500' };
    if (score <= 4) return { strength: 2, label: 'Trung bình', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Mạnh', color: 'bg-green-500' };
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Student ID validation
    if (!formData.maSinhVien) {
      newErrors.maSinhVien = 'Mã sinh viên là bắt buộc';
    }
    
    // Password validation
    if (!formData.matKhau) {
      newErrors.matKhau = 'Mật khẩu là bắt buộc';
    } else {
      const passwordErrors = validatePassword(formData.matKhau);
      if (passwordErrors.length > 0) {
        newErrors.matKhau = 'Mật khẩu phải có: ' + passwordErrors.join(', ');
      }
    }
    
    // Confirm password validation
    if (!formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.matKhau !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Mật khẩu không khớp';
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
      const result = await registrationApi.setupPassword(formData);
      
      // Password setup successful
      navigate('/registration/complete', {
        state: {
          success: true,
          message: result.message,
          studentInfo: {
            maSinhVien: formData.maSinhVien,
            hoTen: studentInfo.hoTen,
            email: studentInfo.email
          }
        }
      });
      
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.matKhau);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Thiết lập Mật khẩu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bước 3: Tạo mật khẩu để hoàn tất đăng ký
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Đăng ký</span>
          </div>
          <div className="w-8 border-t border-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Xác thực Email</span>
          </div>
          <div className="w-8 border-t border-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-sm font-medium text-blue-600">Thiết lập Mật khẩu</span>
          </div>
        </div>

        {/* Password Setup Form */}
        <Card className="mt-8">
          <CardContent className="p-6">
            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Info */}
            {(studentInfo.hoTen || studentInfo.email) && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Thông tin tài khoản</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Mã SV:</strong> {formData.maSinhVien}</p>
                  {studentInfo.hoTen && <p><strong>Họ tên:</strong> {studentInfo.hoTen}</p>}
                  {studentInfo.email && <p><strong>Email:</strong> {studentInfo.email}</p>}
                </div>
              </div>
            )}

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

              {/* Student ID (readonly if from state) */}
              <div>
                <label htmlFor="maSinhVien" className="block text-sm font-medium text-gray-700">
                  Mã sinh viên
                </label>
                <input
                  id="maSinhVien"
                  name="maSinhVien"
                  type="text"
                  value={formData.maSinhVien}
                  onChange={handleInputChange}
                  readOnly={!!location.state?.maSinhVien}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.maSinhVien ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    location.state?.maSinhVien ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Nhập mã sinh viên"
                />
                {errors.maSinhVien && <p className="mt-1 text-sm text-red-600">{errors.maSinhVien}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="matKhau" className="block text-sm font-medium text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="matKhau"
                    name="matKhau"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.matKhau}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.matKhau ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.matKhau && <p className="mt-1 text-sm text-red-600">{errors.matKhau}</p>}
                
                {/* Password strength indicator */}
                {formData.matKhau && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.strength === 1 ? 'text-red-600' :
                        passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="xacNhanMatKhau" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="xacNhanMatKhau"
                    name="xacNhanMatKhau"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.xacNhanMatKhau}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.xacNhanMatKhau ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.xacNhanMatKhau && <p className="mt-1 text-sm text-red-600">{errors.xacNhanMatKhau}</p>}
                
                {/* Password match indicator */}
                {formData.xacNhanMatKhau && (
                  <div className="mt-1">
                    {formData.matKhau === formData.xacNhanMatKhau ? (
                      <p className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mật khẩu khớp
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Mật khẩu không khớp
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Password requirements */}
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Yêu cầu mật khẩu:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      formData.matKhau.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    Ít nhất 6 ký tự
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      /[a-zA-Z]/.test(formData.matKhau) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    Chứa ít nhất 1 chữ cái
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      /\d/.test(formData.matKhau) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    Chứa ít nhất 1 chữ số
                  </li>
                </ul>
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
                    Đang thiết lập...
                  </div>
                ) : (
                  'Hoàn tất đăng ký'
                )}
              </Button>
            </form>

            {/* Navigation */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/registration/check-email', { 
                  state: { email: studentInfo.email, maSinhVien: formData.maSinhVien } 
                })}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Quay lại xác thực email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupPasswordPage;
