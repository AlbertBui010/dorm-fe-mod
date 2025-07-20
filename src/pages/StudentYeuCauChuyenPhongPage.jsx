import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { 
  Plus, 
  Eye, 
  Home,
  User,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import yeuCauChuyenPhongService from '../services/api/yeuCauChuyenPhongService';
import roomService from '../services/api/roomService';
import { authService } from '../services/api';

const StudentYeuCauChuyenPhongPage = () => {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [gioiTinh, setGioiTinh] = useState('');
  // Form data
  const [formData, setFormData] = useState({
    MaPhongMoi: '',
    LyDo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [requestsResponse, profileResponse] = await Promise.all([
        yeuCauChuyenPhongService.getMyYeuCauChuyenPhong(),
        authService.getProfile()
      ]);

      setProfile(profileResponse.data);
      setGioiTinh(profileResponse.data.GioiTinh);

      // Load available rooms after getting profile
      const roomsResponse = await yeuCauChuyenPhongService.getAvailableRoomsAndBeds();
      const filteredRooms = (roomsResponse.data || []).filter(room => {
        // Chỉ lấy phòng có giường trống
        if (!room.Giuongs || room.Giuongs.length === 0) {
          return false;
        }
        
        // Lọc theo giới tính - chỉ lấy phòng Nam/Nữ phù hợp với giới tính sinh viên
        return room.LoaiPhong === profileResponse.data.GioiTinh;
      });
      setAvailableRooms(filteredRooms);

      setMyRequests(requestsResponse.data || []);
      setProfile(profileResponse.data);
      setGioiTinh(profileResponse.data.GioiTinh);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!formData.MaPhongMoi || !formData.LyDo.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const data = {
        MaSinhVien: profile?.MaSinhVien,
        MaPhongMoi: formData.MaPhongMoi,
        LyDo: formData.LyDo
      }
      
      await yeuCauChuyenPhongService.createMyYeuCauChuyenPhong(data);
      toast.success('Tạo yêu cầu chuyển phòng thành công');
      setShowCreateModal(false);
      setFormData({ MaPhongMoi: '', LyDo: '' });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewRequest = async (id) => {
    try {
      const response = await yeuCauChuyenPhongService.getMyYeuCauChuyenPhongById(id);
      setSelectedRequest(response.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error(error.message);
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

  const getCurrentRoom = () => {
    if (profile?.Giuong?.Phong) {
      return `${profile.Giuong.Phong.SoPhong} - ${profile.Giuong.Phong.MoTa || 'Không có mô tả'}`;
    }
    return 'Chưa có thông tin phòng';
  };

  const getCurrentRoomId = () => {
    return profile?.Giuong?.MaPhong;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Yêu cầu chuyển phòng
                </h1>
                <p className="text-gray-600">
                  Quản lý yêu cầu chuyển phòng của bạn
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo yêu cầu mới
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Room Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-blue-600" />
                  Phòng hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phòng</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.Giuong?.Phong?.SoPhong || 'Chưa có thông tin'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giường</label>
                    <p className="text-gray-900">
                      {profile?.Giuong?.SoGiuong || 'Chưa có thông tin'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <p className="text-gray-900">Đang ở</p>
                  </div>
                </div>
                
                {profile?.Giuong?.Phong && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Thông tin phòng hiện tại:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Loại phòng:</span>
                        <p className="font-medium">{profile.Giuong.Phong.LoaiPhong}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Sức chứa:</span>
                        <p className="font-medium">{profile.Giuong.Phong.SoLuongHienTai}/{profile.Giuong.Phong.SucChua} người</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Diện tích:</span>
                        <p className="font-medium">{profile.Giuong.Phong.DienTich}m²</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Giá thuê:</span>
                        <p className="font-medium">{profile.Giuong.Phong.GiaThueThang} VNĐ/tháng</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu chuyển phòng của tôi</CardTitle>
              </CardHeader>
              <CardContent>
                {myRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có yêu cầu chuyển phòng
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Bạn chưa tạo yêu cầu chuyển phòng nào
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo yêu cầu đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((request) => (
                      <div
                        key={request.MaYeuCau}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900">
                                Yêu cầu #{request.MaYeuCau}
                              </h3>
                              {getStatusBadge(request.TrangThai)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Từ phòng:</span>
                                <p className="font-medium">
                                  {profile?.Giuong?.Phong?.SoPhong || 'Chưa có thông tin'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Đến phòng:</span>
                                <p className="font-medium text-blue-600">
                                  {request.PhongMoi?.SoPhong || 'Chưa có thông tin'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Ngày yêu cầu:</span>
                                <p className="font-medium">
                                  {new Date(request.NgayYeuCau).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            
                            {request.LyDo && (
                              <div className="mt-2">
                                <span className="text-gray-500">Lý do:</span>
                                <p className="text-gray-700 mt-1">{request.LyDo}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewRequest(request.MaYeuCau)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Request Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ MaPhongMoi: '', LyDo: '' });
          }}
          title="Tạo yêu cầu chuyển phòng"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng hiện tại
              </label>
              <Input
                value={getCurrentRoom()}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông tin sinh viên
              </label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Mã SV:</span>
                  <p className="font-medium">{profile?.MaSinhVien}</p>
                </div>
                <div>
                  <span className="text-gray-500">Họ tên:</span>
                  <p className="font-medium">{profile?.HoTen}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng muốn chuyển đến *
              </label>
              <select
                value={formData.MaPhongMoi}
                onChange={(e) => setFormData({ ...formData, MaPhongMoi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn phòng</option>
                {availableRooms
                  .filter(room => room.MaPhong !== getCurrentRoomId()) // Loại bỏ phòng hiện tại
                  .map((room) => (
                    <option key={room.MaPhong} value={room.MaPhong}>
                      {room.SoPhong} - {room.MoTa || 'Không có mô tả'} ({room.Giuongs?.length || 0} giường trống)
                    </option>
                  ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do chuyển phòng *
              </label>
              <textarea
                value={formData.LyDo}
                onChange={(e) => setFormData({ ...formData, LyDo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Nhập lý do chuyển phòng..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ MaPhongMoi: '', LyDo: '' });
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateRequest}
                disabled={!formData.MaPhongMoi || !formData.LyDo.trim()}
              >
                Tạo yêu cầu
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Request Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRequest(null);
          }}
          title="Chi tiết yêu cầu chuyển phòng"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã yêu cầu</label>
                  <p className="font-mono text-sm">{selectedRequest.MaYeuCau}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày yêu cầu</label>
                  <p>{new Date(selectedRequest.NgayYeuCau).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng hiện tại</label>
                  <p className="text-gray-600">
                    {profile?.Giuong?.Phong?.SoPhong || 'Chưa có thông tin'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng mới</label>
                  <p className="text-blue-600 font-medium">
                    {selectedRequest.PhongMoi?.SoPhong || 'Chưa có thông tin'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Lý do chuyển phòng</label>
                  <p className="text-gray-700">{selectedRequest.LyDo || 'Không có lý do'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.TrangThai)}</div>
                </div>
                
                {/* Thông tin xử lý */}
                {selectedRequest.TrangThai === 'DA_DUYET' && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Lý do duyệt</label>
                      <p className="text-green-700">{selectedRequest.LyDo || 'Không có lý do duyệt'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Người duyệt</label>
                      <p className="text-gray-700">{selectedRequest.NguoiCapNhat || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày duyệt</label>
                      <p className="text-gray-700">
                        {selectedRequest.NgayCapNhat ? new Date(selectedRequest.NgayCapNhat).toLocaleDateString('vi-VN') : 'Không có thông tin'}
                      </p>
                    </div>
                  </>
                )}
                
                {selectedRequest.TrangThai === 'TU_CHOI' && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Lý do từ chối</label>
                      <p className="text-red-700">{selectedRequest.LyDo || 'Không có lý do từ chối'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Người từ chối</label>
                      <p className="text-gray-700">{selectedRequest.NguoiCapNhat || 'Không có thông tin'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày từ chối</label>
                      <p className="text-gray-700">
                        {selectedRequest.NgayCapNhat ? new Date(selectedRequest.NgayCapNhat).toLocaleDateString('vi-VN') : 'Không có thông tin'}
                      </p>
                    </div>
                  </>
                )}
                
                {selectedRequest.TrangThai === 'CHO_DUYET' && (
                  <div className="col-span-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        <span className="font-medium">Yêu cầu đang chờ duyệt</span>
                        <br />
                        Vui lòng chờ nhân viên quản lý xử lý yêu cầu của bạn.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default StudentYeuCauChuyenPhongPage; 