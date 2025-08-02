import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { Badge } from './ui/Badge';
import { Home, Eye, Plus } from 'lucide-react';
import yeuCauChuyenPhongService from '../services/api/yeuCauChuyenPhongService';

const RecentYeuCauChuyenPhongCard = ({ onNavigateToRequests }) => {
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentRequests();
  }, []);

  const loadRecentRequests = async () => {
    try {
      setLoading(true);
      const response = await yeuCauChuyenPhongService.getMyYeuCauChuyenPhong();
      const requests = response.data || [];
      // Lấy 3 yêu cầu gần nhất
      setRecentRequests(requests.slice(0, 3));
    } catch (error) {
      console.error('Error loading recent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CHO_DUYET': { variant: 'warning', text: 'Chờ duyệt' },
      'DA_DUYET': { variant: 'success', text: 'Đã duyệt' },
      'TU_CHOI': { variant: 'danger', text: 'Từ chối' },
      'Chờ duyệt': { variant: 'warning', text: 'Chờ duyệt' },
      'Đã duyệt': { variant: 'success', text: 'Đã duyệt' },
      'Từ chối': { variant: 'danger', text: 'Từ chối' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-blue-600" />
            Yêu cầu chuyển phòng gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-blue-600" />
            Yêu cầu chuyển phòng gần đây
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateToRequests}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tạo mới
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentRequests.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">Chưa có yêu cầu chuyển phòng nào</p>
            <Button
              size="sm"
              onClick={onNavigateToRequests}
              className="flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tạo yêu cầu đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.MaYeuCau}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        Yêu cầu #{request.MaYeuCau}
                      </h4>
                      {getStatusBadge(request.TrangThai)}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>
                          <span className="text-gray-500">Từ:</span> {request.PhongHienTai?.SoPhong || request.PhongHienTai || 'Chưa có thông tin'}
                        </span>
                        <span>
                          <span className="text-gray-500">Đến:</span> {request.PhongMoi?.SoPhong || request.PhongMoi || 'Chưa có thông tin'}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-gray-500">Ngày:</span> {new Date(request.NgayYeuCau).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigateToRequests()}
                    className="ml-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {recentRequests.length > 0 && (
              <div className="text-center pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNavigateToRequests}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Xem tất cả yêu cầu
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentYeuCauChuyenPhongCard; 