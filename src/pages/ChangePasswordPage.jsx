import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authService } from "../services/api/authService";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

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
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      
      // Redirect back to dashboard
      const user = authService.getCurrentUser();
      if (user && user.MaSinhVien) {
        navigate("/student/dashboard");
      } else {
        navigate("/dashboard");
      }
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
          toast.error(errMsg || "Có lỗi xảy ra khi đổi mật khẩu");
        }
      }
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600 mt-2">Đổi mật khẩu</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    error={errors.currentPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu mới"
                    error={errors.newPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
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
                  Xác nhận mật khẩu mới
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
                Đổi mật khẩu
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const user = authService.getCurrentUser();
                  if (user && user.MaSinhVien) {
                    navigate("/student/dashboard");
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại trang chủ
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage; 