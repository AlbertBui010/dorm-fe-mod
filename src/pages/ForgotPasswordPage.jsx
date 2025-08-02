import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";
import { authService } from "../services/api/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.sendPasswordResetEmail(email);
      setEmailSent(true);
      toast.success("Email khôi phục mật khẩu đã được gửi!");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi gửi email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
            <p className="text-gray-600 mt-2">Khôi phục mật khẩu</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Email đã được gửi!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Chúng tôi đã gửi email khôi phục mật khẩu đến{" "}
                  <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn và
                  làm theo hướng dẫn.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/login")}
                    variant="primary"
                    className="w-full"
                  >
                    Quay lại đăng nhập
                  </Button>
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Gửi lại email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600 mt-2">Khôi phục mật khẩu</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Nhập email đã đăng ký để nhận link khôi phục mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Gửi email khôi phục
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

export default ForgotPasswordPage; 