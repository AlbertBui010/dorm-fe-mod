import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

const PaymentResult = ({ 
  type = 'success', 
  title, 
  message, 
  orderCode, 
  autoRedirect = true, 
  redirectDelay = 5000,
  redirectPath = '/student/payments'
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        navigate(redirectPath);
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [navigate, autoRedirect, redirectDelay, redirectPath]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          icon: CheckCircle,
          primaryBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          icon: XCircle,
          primaryBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
      default:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          icon: AlertTriangle,
          primaryBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-8 shadow-sm`}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo/logo-stu.png" 
              alt="STU Logo" 
              className="w-16 h-16"
            />
          </div>
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`${config.iconBg} rounded-full p-3`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
          </div>
          
          {/* Title */}
          <h1 className={`text-2xl font-bold text-center ${config.titleColor} mb-3`}>
            {title}
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 text-center mb-4 leading-relaxed">
            {message}
          </p>
          
          {/* Order Code */}
          {orderCode && (
            <div className="bg-white rounded-md p-3 mb-6 border border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Mã giao dịch
              </p>
              <p className="font-mono text-sm text-gray-900 text-center mt-1">
                {orderCode}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(redirectPath)}
              className={`w-full ${config.primaryBtn} text-white py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Quay lại thanh toán
            </button>
            
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Về Dashboard
            </button>
          </div>
          
          {/* Auto redirect notice */}
          {autoRedirect && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Tự động chuyển về trang thanh toán sau {redirectDelay / 1000} giây...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

PaymentResult.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning']),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  orderCode: PropTypes.string,
  autoRedirect: PropTypes.bool,
  redirectDelay: PropTypes.number,
  redirectPath: PropTypes.string,
};

export default PaymentResult;
