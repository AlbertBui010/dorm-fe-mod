import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Key } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { authService } from '../services/api/authService';
import { validatePassword, getPasswordStrength } from '../utils/passwordStrength';
import { handlePasswordChangeError } from '../utils/errorHandler';

const ChangePasswordModal = ({ isOpen, onClose, studentInfo }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.currentPassword.trim()) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!formData.newPassword.trim()) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        errors.newPassword = passwordErrors.join(', ');
      }
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    return errors;
  };
  
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };  const handleInputChange = (e) => {
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Show confirmation dialog first
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      toast.success('Đổi mật khẩu thành công!', {
        duration: 4000,
      });
      handleClose();
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Use error handler utility
      const { hasFieldErrors, fieldErrors, generalMessage } = handlePasswordChangeError(error);
      
      if (hasFieldErrors) {
        // Set field-specific errors
        setErrors(fieldErrors);
      } else if (generalMessage) {
        // Show general error message
        toast.error(generalMessage, {
          duration: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    setShowConfirmation(false);
    onClose();
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi mật khẩu"
      size="md"
    >
      <div className="space-y-6">
        {/* Student Info */}
        {studentInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {studentInfo.HoTen?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">
                  {studentInfo.HoTen}
                </p>
                <p className="text-sm text-blue-700">
                  {studentInfo.MaSinhVien} • {studentInfo.Email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Warning */}
        {showConfirmation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Xác nhận đổi mật khẩu
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Bạn có chắc chắn muốn đổi mật khẩu? Sau khi đổi, bạn sẽ cần sử dụng mật khẩu mới để đăng nhập.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu hiện tại"
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
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
                    style={{ width: passwordStrength.width }}
                  ></div>
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && formData.newPassword && (
              <div className="mt-1">
                {formData.newPassword === formData.confirmPassword ? (
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mật khẩu khớp
                  </p>
                ) : (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Mật khẩu không khớp
                  </p>
                )}
              </div>
            )}
            
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Key className="h-4 w-4 mr-1" />
              Yêu cầu mật khẩu
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Ít nhất 6 ký tự
              </li>
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  /[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Chứa ít nhất 1 chữ thường
              </li>
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  /[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Chứa ít nhất 1 chữ hoa
              </li>
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  /\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                Chứa ít nhất 1 chữ số
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || (!showConfirmation && !isFormValid())}
              variant={showConfirmation ? "destructive" : "default"}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </div>
              ) : showConfirmation ? (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Xác nhận đổi mật khẩu
                </div>
              ) : (
                'Đổi mật khẩu'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={showConfirmation ? () => setShowConfirmation(false) : handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              {showConfirmation ? 'Quay lại' : 'Hủy'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  studentInfo: PropTypes.shape({
    HoTen: PropTypes.string,
    MaSinhVien: PropTypes.string,
    Email: PropTypes.string
  }).isRequired
};

export default ChangePasswordModal;
