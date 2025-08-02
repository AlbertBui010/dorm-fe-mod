import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { authService } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authService.forgotPassword(email);
      setMessage(result.message);
      setIsEmailSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.forgotPassword(email);
      setMessage(result.message + ' (Đã gửi lại)');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
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
              <Mail className="h-8 w-8 text-green-600" style={{ display: 'none' }} />
            </div>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Email đã được gửi!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Kiểm tra hộp thư của bạn
            </p>
          </div>

          <Card>
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

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Chúng tôi đã gửi email reset mật khẩu đến:
                  </p>
                  <p className="font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                    {email}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    📧 Hướng dẫn tiếp theo:
                  </h4>
                  <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                    <li>Kiểm tra hộp thư email của bạn</li>
                    <li>Nhấp vào link trong email hoặc copy mã xác thực</li>
                    <li>Nhập mật khẩu mới theo yêu cầu</li>
                  </ol>
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

                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? 'Đang gửi...' : 'Gửi lại email'}
                  </Button>

                  <Button
                    onClick={() => navigate('/reset-password', { 
                      state: { email } 
                    })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Tôi đã có mã xác thực →
                  </Button>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Quay lại đăng nhập
                  </Link>
                </div>
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
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
            <Mail className="h-8 w-8 text-red-600" style={{ display: 'none' }} />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập email của bạn để nhận link reset mật khẩu
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
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
                disabled={isLoading || !email.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi email reset mật khẩu'}
              </Button>
            </form>

            <div className="mt-6 text-center">
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
                Chỉ nhập email vào các trang web chính thức. Không chia sẻ mã xác thực với ai khác.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
