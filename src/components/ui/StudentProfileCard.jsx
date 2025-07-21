import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Badge } from "./Badge";
import {
  Clock,
  Calendar,
  FileText,
  MapPin,
  User,
  Mail,
  Phone,
} from "lucide-react";

const StudentProfileCard = ({ profile }) => {
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = (trangThai) => {
    switch (trangThai) {
      case "CHO_DUYET":
        return {
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          text: "Chờ duyệt",
          description: "Đăng ký đang được xem xét",
        };
      case "DUYET":
        return {
          icon: Clock,
          color: "bg-green-100 text-green-800 border-green-200",
          text: "Đã duyệt",
          description: "Đăng ký đã được phê duyệt",
        };
      case "TU_CHOI":
        return {
          icon: Clock,
          color: "bg-red-100 text-red-800 border-red-200",
          text: "Từ chối",
          description: "Đăng ký không được phê duyệt",
        };
      default:
        return {
          icon: Clock,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          text: "Không xác định",
          description: "Trạng thái không rõ",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const currentRegistration =
    profile.dangKys && profile.dangKys.length > 0 ? profile.dangKys[0] : null;
  const hasActiveRegistration =
    currentRegistration &&
    ["CHO_DUYET", "DUYET", "DANG_O"].includes(currentRegistration.TrangThai);

  return (
    <div className="space-y-6">
      {/* Student Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Thông tin sinh viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Mã sinh viên
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {profile.MaSinhVien}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Họ và tên
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {profile.HoTen}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 flex items-center">
                <Mail className="h-4 w-4 mr-1 text-gray-400" />
                {profile.Email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Số điện thoại
              </label>
              <p className="text-gray-900 flex items-center">
                <Phone className="h-4 w-4 mr-1 text-gray-400" />
                {profile.SoDienThoai || "Chưa có"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Ngày sinh
              </label>
              <p className="text-gray-900">{formatDate(profile.NgaySinh)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Giới tính
              </label>
              <p className="text-gray-900">{profile.GioiTinh || "Chưa có"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Status Card */}
      {hasActiveRegistration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin đăng ký ký túc xá
              </span>
              <Badge
                className={getStatusInfo(currentRegistration.TrangThai).color}
              >
                <Clock className="h-3 w-3 mr-1" />
                {getStatusInfo(currentRegistration.TrangThai).text}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Trạng thái:</strong>{" "}
                {getStatusInfo(currentRegistration.TrangThai).description}
              </p>
              <p className="text-xs text-blue-600">
                Mã đăng ký: #{currentRegistration.MaDangKy}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Ngày đăng ký
                </label>
                <p className="text-gray-900 font-medium">
                  {formatDate(currentRegistration.NgayDangKy)}
                </p>
              </div>

              {currentRegistration.NgayNhanPhong && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Ngày nhận phòng dự kiến
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(currentRegistration.NgayNhanPhong)}
                  </p>
                </div>
              )}

              {currentRegistration.NgayKetThucHopDong && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Ngày tính tiền phòng dự kiến
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(currentRegistration.NgayKetThucHopDong)}
                  </p>
                </div>
              )}

              {currentRegistration.Phong && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Phòng được phân bổ
                  </label>
                  <p className="text-gray-900 font-medium">
                    {currentRegistration.Phong.SoPhong}
                  </p>
                </div>
              )}
            </div>

            {currentRegistration.NguyenVong && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nguyện vọng
                </label>
                <div className="bg-gray-50 border rounded-lg p-3 mt-1">
                  <p className="text-gray-700 text-sm">
                    {currentRegistration.NguyenVong}
                  </p>
                </div>
              </div>
            )}

            {currentRegistration.TrangThai === "CHO_DUYET" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Đơn đăng ký của bạn đang được xem xét.
                  Chúng tôi sẽ thông báo kết quả qua email trong thời gian sớm
                  nhất.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Registration Card */}
      {!hasActiveRegistration && (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đăng ký ký túc xá
            </h3>
            <p className="text-gray-500 mb-4">
              Bạn chưa có đơn đăng ký ký túc xá nào đang hoạt động.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProfileCard;
