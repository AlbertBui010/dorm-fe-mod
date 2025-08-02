import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authService } from "../services/api/authService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [errors, setErrors] = useState({});

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Link khôi phục mật khẩu không hợp lệ");
      navigate("/forgot-password");
      return;
    }

    verifyToken();
  }, [token, navigate]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const result = await authService.verifyResetToken(token);
      setTokenValid(true);
      setUserInfo(result.data);
    } catch (error) {
      setTokenValid(false);
      toast.error(error.message || "Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn");
    } finally {
      setVerifying(false);
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push("Ít nhất 6 ký tự");
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Ít nhất 1 chữ cái");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Ít nhất 1 chữ số");
    }
    
    return errors;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    
    const errors = validatePassword(password);
    const strength = 4 - errors.length;
    
    if (strength <= 1) return { strength, label: "Yếu", color: "bg-red-500" };
    if (strength === 2) return { strength, label: "Trung bình", color: "bg-yellow-500" };
    if (strength === 3) return { strength, label: "Khá", color: "bg-blue-500" };
    return { strength, label: "Mạnh", color: "bg-green-500" };
  };

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
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate new password
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(", ");
    }

    // Validate confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.newPassword);
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        // Lấy lỗi cho từng field
        const newErrors = {};
        apiErrors.forEach(err => {
          if (err.field && err.message) {
            newErrors[err.field] = err.message;
          }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
      } else {
        const errMsg = error?.response?.data?.message || error.message || "";
        if (errMsg.includes("không được trùng với mật khẩu cũ")) {
          setErrors(prev => ({ ...prev, newPassword: "Mật khẩu mới không được trùng với mật khẩu cũ" }));
        } else {
          toast.error(errMsg || "Có lỗi xảy ra khi đặt lại mật khẩu");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Link không hợp lệ
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.
              </p>
              <Button
                onClick={() => navigate("/forgot-password")}
                variant="primary"
                className="w-full"
              >
                Yêu cầu link mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo/logo-stu.png"
            alt="STU Logo"
            className="mx-auto mb-4 w-28 h-28"
          />
          <h1 className="text-3xl font-bold text-gray-900">Ký túc xá STU</h1>
          <p className="text-gray-600 mt-2">Đặt lại mật khẩu</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {userInfo && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Xin chào {userInfo.hoTen}!</strong>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu mới"
                    error={errors.newPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu mới"
                    error={errors.confirmPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Đặt lại mật khẩu
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 