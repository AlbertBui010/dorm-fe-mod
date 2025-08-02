import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { authService } from "../services/api/authService";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(credentials);
      toast.success(result.message || "Đăng nhập thành công!");

      // Kiểm tra loại user để redirect đúng trang
      const user = result.data?.user;
      if (user && user.MaSinhVien) {
        // Nếu là sinh viên -> chuyển đến student dashboard
        navigate("/student/dashboard");
      } else {
        // Nếu là admin/nhân viên -> chuyển đến admin dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Tên đăng nhập / Email"
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                placeholder="Nhập tên đăng nhập hoặc email"
                required
              />

              <Input
                label="Mật khẩu"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="Nhập mật khẩu"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Đăng nhập
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => navigate("/registration/register")}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Đăng ký ở ký túc xá
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
