import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { Badge } from './ui/Badge';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';
import registrationApi from '../services/api/registrationApi';

const RegistrationStatusCard = ({ maSinhVien, profileData = null, showActions = true, title = "Thông tin đăng ký ký túc xá" }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    if (!maSinhVien) return;
    
    try {
      setError('');
      
      // If profileData is provided, use it directly instead of API call
      if (profileData) {
        const mappedData = {
          maSinhVien: profileData.MaSinhVien,
          hoTen: profileData.HoTen,
          emailDaXacThuc: profileData.EmailDaXacThuc,
          dangKy: profileData.dangKys && profileData.dangKys.length > 0 ? profileData.dangKys[0] : null
        };
        setStatus(mappedData);
      } else {
        const result = await registrationApi.getRegistrationStatus(maSinhVien);
        setStatus(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [maSinhVien, profileData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
  };

  const getStatusInfo = (trangThai) => {
    switch (trangThai) {
      case 'CHO_DUYET':
        return {
          icon: Clock,
          color: 'yellow',
          text: 'Chờ duyệt',
          description: 'Đăng ký đang được xem xét'
        };
      case 'DA_DUYET':
        return {
          icon: CheckCircle,
          color: 'green',
          text: 'Đã duyệt',
          description: 'Đăng ký đã được phê duyệt'
        };
      case 'TU_CHOI':
        return {
          icon: XCircle,
          color: 'red',
          text: 'Từ chối',
          description: 'Đăng ký không được phê duyệt'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          text: 'Không xác định',
          description: 'Trạng thái không rõ'
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải trạng thái...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            {showActions && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status || !status.dangKy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-3">Chưa có đăng ký ký túc xá</p>
            {showActions && (
              <Button
                onClick={() => window.location.href = '/registration/register'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Đăng ký ngay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(status.dangKy.TrangThai);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            {title}
          </span>
          {showActions && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Status */}
        <div className="flex items-center space-x-3">
          <StatusIcon className={`h-8 w-8 text-${statusInfo.color}-500`} />
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant={statusInfo.color}>{statusInfo.text}</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900">Thông tin đăng ký</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Mã đăng ký:</span>
              <div className="font-medium">#{status.dangKy.MaDangKy}</div>
            </div>
            <div>
              <span className="text-gray-500">Ngày đăng ký:</span>
              <div className="font-medium">{formatDate(status.dangKy.NgayDangKy)}</div>
            </div>
            {status.dangKy.NgayNhanPhong && (
              <div>
                <span className="text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Ngày nhận phòng dự kiến:
                </span>
                <div className="font-medium">{formatDate(status.dangKy.NgayNhanPhong)}</div>
              </div>
            )}
            {status.dangKy.NgayKetThucHopDong && (
              <div>
                <span className="text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Ngày tính tiền phòng dự kiến:
                </span>
                <div className="font-medium">{formatDate(status.dangKy.NgayKetThucHopDong)}</div>
              </div>
            )}
            {status.dangKy.Phong && (
              <div>
                <span className="text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Phòng được phân bổ:
                </span>
                <div className="font-medium">{status.dangKy.Phong.SoPhong}</div>
              </div>
            )}
            <div>
              <span className="text-gray-500">Email xác thực:</span>
              <div className="font-medium">
                {status.emailDaXacThuc ? (
                  <span className="text-green-600">✓ Đã xác thực</span>
                ) : (
                  <span className="text-red-600">✗ Chưa xác thực</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Preferences */}
        {status.dangKy.NguyenVong && (
          <div>
            <label className="text-sm font-medium text-gray-500">Nguyện vọng</label>
            <div className="bg-gray-50 border rounded-lg p-3 mt-1">
              <p className="text-gray-700 text-sm">{status.dangKy.NguyenVong}</p>
            </div>
          </div>
        )}

        {/* Status-specific actions and information */}
        {status.dangKy.TrangThai === 'CHO_DUYET' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Đăng ký đang được xem xét</p>
                <p className="text-yellow-700">
                  Phòng Quản lý Ký túc xá sẽ xem xét và phê duyệt đăng ký của bạn trong 2-3 ngày làm việc. 
                  Bạn sẽ nhận được email thông báo kết quả.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.dangKy.TrangThai === 'DA_DUYET' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">Chúc mừng! Đăng ký đã được duyệt</p>
                <p className="text-green-700">
                  Vui lòng chờ thông báo về việc phân phòng và hướng dẫn làm thủ tục nhận phòng.
                </p>
              </div>
            </div>
          </div>
        )}

        {status.dangKy.TrangThai === 'TU_CHOI' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 mb-1">Đăng ký không được phê duyệt</p>
                <p className="text-red-700">
                  Vui lòng liên hệ Phòng Quản lý Ký túc xá để biết thêm chi tiết và hướng dẫn.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {showActions && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Thông tin liên hệ</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>ktx@stu.edu.vn</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>0929812000</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationStatusCard;
