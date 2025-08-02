import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Key, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { authService } from '../services/api';
import { validatePassword } from '../utils/passwordStrength';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get email and token from URL params or location state
    const emailFromParams = searchParams.get('email');
    const tokenFromParams = searchParams.get('token');
    const emailFromState = location.state?.email;

    setFormData(prev => ({
      ...prev,
      email: emailFromParams || emailFromState || '',
      token: tokenFromParams || '',
    }));
  }, [searchParams, location.state]);

  useEffect(() => {
    if (formData.newPassword) {
      const errors = validatePassword(formData.newPassword);
      const isValid = errors.length === 0;
      
      setPasswordStrength({
        isValid,
        errors,
        message: isValid 
          ? '✓ Mật khẩu đủ mạnh' 
          : errors.join(', '),
        strength: isValid ? 'strong' : 'weak'
      });
    } else {
      setPasswordStrength({});
    }
  }, [formData.newPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!formData.token.trim()) {
      setError('Mã xác thực không hợp lệ. Vui lòng thử lại từ email.');
      return;
    }

    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (!passwordStrength.isValid && formData.newPassword) {
      setError('Mật khẩu mới không đủ mạnh: ' + (passwordStrength.message || 'Vui lòng chọn mật khẩu mạnh hơn.'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authService.resetPassword(
        formData.email,
        formData.token,
        formData.newPassword,
        formData.confirmPassword
      );
      
      setMessage(result.message);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Mật khẩu đã được reset thành công. Vui lòng đăng nhập với mật khẩu mới.' 
          }
        });
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <img 
                src="/logo/stu-logo.png" 
                alt="STU Logo" 
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  // Fallback to icon if logo not found
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <CheckCircle className="h-8 w-8 text-green-600" style={{ display: 'none' }} />
            </div>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Reset thành công!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Mật khẩu của bạn đã được thay đổi
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{message}</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Bạn sẽ được chuyển đến trang đăng nhập trong vài giây...
                </p>

                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Đăng nhập ngay
                </Button>
              </div>
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
          <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <img 
              src="/logo/stu-logo.png" 
              alt="STU Logo" 
              className="h-12 w-12 object-contain"
              onError={(e) => {
                // Fallback to icon if logo not found
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <Key className="h-8 w-8 text-blue-600" style={{ display: 'none' }} />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Đặt mật khẩu mới
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email đã đăng ký
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email của bạn"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Hidden token field - không hiển thị cho user */}
              <input
                type="hidden"
                name="token"
                value={formData.token}
              />

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu mới"
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className={`text-xs ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.message}
                    </div>
                    {passwordStrength.errors && passwordStrength.errors.length > 0 && (
                      <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                        {passwordStrength.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                          passwordStrength.strength === 'strong' ? 'bg-green-500 w-full' :
                          'bg-gray-300 w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu mới"
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2">
                    <div className={`text-xs ${
                      formData.newPassword === formData.confirmPassword 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formData.newPassword === formData.confirmPassword 
                        ? '✓ Mật khẩu khớp' 
                        : '✗ Mật khẩu không khớp'}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !formData.email.trim() || 
                  !formData.token.trim() || 
                  !formData.newPassword || 
                  !formData.confirmPassword ||
                  (passwordStrength.isValid === false && formData.newPassword) ||
                  (formData.newPassword !== formData.confirmPassword)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt mật khẩu mới'}
              </Button>
            </form>

            <div className="mt-6 flex flex-col space-y-3">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 text-center"
              >
                Chưa nhận được email? Gửi lại
              </Link>
              
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Lưu ý bảo mật
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Mã xác thực được lấy tự động từ link email. Sử dụng mật khẩu mạnh để bảo vệ tài khoản.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
