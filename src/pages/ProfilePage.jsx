import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { authService } from "../services/api";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [profileForm, setProfileForm] = useState({
    HoTen: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhauMoi: "",
  });

  const [errors, setErrors] = useState({});

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      const profileData = response.data;
      
      setProfile(profileData);
      setProfileForm({
        HoTen: profileData.HoTen || "",
        Email: profileData.Email || "",
        SoDienThoai: profileData.SoDienThoai || "",
        DiaChi: profileData.DiaChi || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileForm.HoTen.trim()) {
      newErrors.HoTen = "Họ tên không được để trống";
    }

    if (!profileForm.Email.trim()) {
      newErrors.Email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.Email)) {
      newErrors.Email = "Email không hợp lệ";
    }

    if (profileForm.SoDienThoai && !/^[0-9]{10,11}$/.test(profileForm.SoDienThoai)) {
      newErrors.SoDienThoai = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      setSaving(true);
      await authService.updateProfile(profileForm);
      toast.success("Cập nhật thông tin thành công");
      await loadProfile(); // Reload profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.matKhauCu) {
      newErrors.matKhauCu = "Mật khẩu cũ không được để trống";
    }

    if (!passwordForm.matKhauMoi) {
      newErrors.matKhauMoi = "Mật khẩu mới không được để trống";
    } else if (passwordForm.matKhauMoi.length < 6) {
      newErrors.matKhauMoi = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!passwordForm.xacNhanMatKhauMoi) {
      newErrors.xacNhanMatKhauMoi = "Xác nhận mật khẩu không được để trống";
    } else if (passwordForm.matKhauMoi !== passwordForm.xacNhanMatKhauMoi) {
      newErrors.xacNhanMatKhauMoi = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setSaving(true);
      await authService.changePassword({
        matKhauCu: passwordForm.matKhauCu,
        matKhauMoi: passwordForm.matKhauMoi,
      });
      toast.success("Đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setPasswordForm({
        matKhauCu: "",
        matKhauMoi: "",
        xacNhanMatKhauMoi: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Cài đặt tài khoản
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý thông tin cá nhân và bảo mật tài khoản
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin cá nhân
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <Input
                  type="text"
                  value={profileForm.HoTen}
                  onChange={(e) => handleProfileChange("HoTen", e.target.value)}
                  placeholder="Nhập họ và tên"
                  error={errors.HoTen}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={profileForm.Email}
                  onChange={(e) => handleProfileChange("Email", e.target.value)}
                  placeholder="Nhập email"
                  error={errors.Email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <Input
                  type="tel"
                  value={profileForm.SoDienThoai}
                  onChange={(e) => handleProfileChange("SoDienThoai", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  error={errors.SoDienThoai}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <Input
                  type="text"
                  value={profileForm.DiaChi}
                  onChange={(e) => handleProfileChange("DiaChi", e.target.value)}
                  placeholder="Nhập địa chỉ"
                  error={errors.DiaChi}
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thông tin
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Account Security */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-red-600" />
              Bảo mật tài khoản
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{profile?.Email || "Chưa có"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Vai trò</p>
                    <p className="text-sm text-gray-600">
                      {profile?.VaiTro === "QuanTriVien" ? "Quản trị viên" : "Nhân viên"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </Button>
            </div>
          </Card>
        </div>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Đổi mật khẩu"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  value={passwordForm.matKhauCu}
                  onChange={(e) => handlePasswordChange("matKhauCu", e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  error={errors.matKhauCu}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.matKhauMoi}
                  onChange={(e) => handlePasswordChange("matKhauMoi", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  error={errors.matKhauMoi}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.xacNhanMatKhauMoi}
                  onChange={(e) => handlePasswordChange("xacNhanMatKhauMoi", e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  error={errors.xacNhanMatKhauMoi}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đổi...
                  </>
                ) : (
                  "Đổi mật khẩu"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProfilePage; 