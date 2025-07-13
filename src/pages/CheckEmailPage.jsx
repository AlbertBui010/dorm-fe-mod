import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Mail, CheckCircle, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import registrationApi from '../services/api/registrationApi';

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [maSinhVien, setMaSinhVien] = useState('');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Get data from navigation state or URL params
    const stateData = location.state;
    const tokenFromUrl = searchParams.get('token');
    const errorFromUrl = searchParams.get('error');
    
    if (stateData) {
      setEmail(stateData.email || '');
      setMaSinhVien(stateData.maSinhVien || '');
      setMessage(stateData.message || 'Vui lòng kiểm tra email để xác thực tài khoản.');
    }

    if (tokenFromUrl) {
      setVerificationToken(tokenFromUrl);
      handleAutoVerification(tokenFromUrl);
    }

    if (errorFromUrl) {
      handleUrlError(errorFromUrl);
    }
  }, [location.state, searchParams]);

  const handleAutoVerification = async (token) => {
    setIsVerifying(true);
    try {
      const result = await registrationApi.verifyEmail(token);
      if (result.success) {
        // Redirect to password setup
        navigate('/registration/setup-password', {
          state: {
            maSinhVien: result.data.maSinhVien,
            hoTen: result.data.hoTen,
            email: result.data.email,
            message: result.message
          }
        });
      }
    } catch (error) {
      setResendError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUrlError = (errorType) => {
    switch (errorType) {
      case 'missing_token':
        setResendError('Liên kết xác thực không hợp lệ.');
        break;
      case 'invalid_token':
        setResendError('Mã xác thực không hợp lệ hoặc đã hết hạn.');
        break;
      case 'server_error':
        setResendError('Có lỗi xảy ra. Vui lòng thử lại.');
        break;
      default:
        setResendError('Có lỗi xảy ra trong quá trình xác thực.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('Không tìm thấy địa chỉ email. Vui lòng đăng ký lại.');
      return;
    }

    setIsResending(true);
    setResendError('');
    setResendMessage('');

    try {
      const result = await registrationApi.resendVerification(email);
      setResendMessage(result.message);
    } catch (error) {
      setResendError(error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleManualVerification = async () => {
    if (!verificationToken.trim()) {
      setResendError('Vui lòng nhập mã xác thực.');
      return;
    }

    setIsVerifying(true);
    setResendError('');

    try {
      const result = await registrationApi.verifyEmail(verificationToken.trim());
      if (result.success) {
        navigate('/registration/setup-password', {
          state: {
            maSinhVien: result.data.maSinhVien,
            hoTen: result.data.hoTen,
            email: result.data.email,
            message: result.message
          }
        });
      }
    } catch (error) {
      setResendError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Kiểm tra Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bước 2: Xác thực địa chỉ email
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">Đăng ký</span>
          </div>
          <div className="w-8 border-t border-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="ml-2 text-sm font-medium text-blue-600">Xác thực Email</span>
          </div>
          <div className="w-8 border-t border-gray-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-sm text-gray-500">Thiết lập Mật khẩu</span>
          </div>
        </div>

        {/* Email Check Content */}
        <Card className="mt-8">
          <CardContent className="p-6">
            {isVerifying ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang xác thực email...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                {message && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm text-green-800">{message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="text-center">
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Email xác thực đã được gửi
                    </h3>
                    {email && (
                      <p className="text-sm text-gray-600 mb-4">
                        Chúng tôi đã gửi email xác thực đến: <strong>{email}</strong>
                      </p>
                    )}
                    <div className="text-left bg-white rounded-md p-4 text-sm text-gray-600">
                      <p className="font-medium mb-2">Hướng dẫn:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Kiểm tra hộp thư email của bạn</li>
                        <li>Tìm email từ "Ký túc xá STU"</li>
                        <li>Nhấp vào nút "Xác thực Email" trong email</li>
                        <li>Hoặc copy mã xác thực và nhập vào form bên dưới</li>
                      </ol>
                    </div>
                  </div>

                  {/* Time indicator */}
                  <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Email có thể mất 2-3 phút để được gửi đến</span>
                  </div>
                </div>

                {/* Manual verification */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Nhập mã xác thực thủ công
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      placeholder="Nhập mã xác thực từ email"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      onClick={handleManualVerification}
                      disabled={!verificationToken.trim() || isVerifying}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Xác thực
                    </Button>
                  </div>
                </div>

                {/* Error Messages */}
                {resendError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{resendError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resend Success */}
                {resendMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm text-green-800">{resendMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resend Email Button */}
                <div className="border-t pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Không nhận được email?
                    </p>
                    <Button
                      onClick={handleResendEmail}
                      disabled={isResending || !email}
                      variant="outline"
                      className="inline-flex items-center"
                    >
                      {isResending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Gửi lại email
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional Help */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Kiểm tra cả thư mục Spam/Junk</li>
                      <li>Email xác thực có hiệu lực trong 24 giờ</li>
                      <li>Nếu vẫn không nhận được, hãy liên hệ hỗ trợ</li>
                    </ul>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    onClick={() => navigate('/registration/register')}
                    variant="outline"
                  >
                    ← Quay lại đăng ký
                  </Button>
                  
                  {maSinhVien && (
                    <Button
                      onClick={() => navigate('/registration/setup-password', {
                        state: { maSinhVien, skipVerification: true }
                      })}
                      variant="outline"
                    >
                      Tôi đã xác thực →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmailPage;
