import React, { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';

import registrationApprovalService from '../services/registrationApprovalService';
import RoomFeeCalculationModal from '../components/RoomFeeCalculationModal';

const RegistrationApprovalPage = () => {
  // State management
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [lastApprovalResult, setLastApprovalResult] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    gioiTinh: '',
    nguyenVong: '',
    trangThai: ''
  });

  // Form states
  const [approvalForm, setApprovalForm] = useState({
    maPhong: '',
    maGiuong: '',
    ghiChu: ''
  });
  const [rejectForm, setRejectForm] = useState({
    lyDoTuChoi: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadRegistrations();
    loadStats();
  }, [currentPage, filters]);

  // Load pending registrations
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      let trangThaiParam = filters.trangThai;
      if (!trangThaiParam) {
        trangThaiParam = 'CHO_DUYET,DA_DUYET,TU_CHOI';
      }
      const response = await registrationApprovalService.getPendingRegistrations({
        page: currentPage,
        limit: pageSize,
        ...filters,
        trangThai: trangThaiParam,
      });

      if (response.success) {
        setRegistrations(response.data.registrations);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      alert('Có lỗi xảy ra khi tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await registrationApprovalService.getRegistrationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // View registration detail and find available rooms
  const viewRegistrationDetail = async (registration) => {
    try {
      setSelectedRegistration(registration);
      
      // Find available rooms for this registration
      const roomsResponse = await registrationApprovalService.findAvailableRooms(registration.MaDangKy);
      if (roomsResponse.success) {
        setAvailableRooms(roomsResponse.data.rooms);
      }
      
      setShowRoomModal(true);
    } catch (error) {
      console.error('Error loading registration detail:', error);
      alert('Có lỗi xảy ra khi tải chi tiết đăng ký');
    }
  };

  // Handle room and bed selection
  const selectRoomAndBed = (room, bed) => {
    setApprovalForm(prev => ({
      ...prev,
      maPhong: room.MaPhong,
      maGiuong: bed.MaGiuong
    }));
  };

  // Approve registration
  const approveRegistration = async () => {
    if (!approvalForm.maPhong || !approvalForm.maGiuong) {
      alert('Vui lòng chọn phòng và giường');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn duyệt đăng ký này?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await registrationApprovalService.approveRegistration(
        selectedRegistration.MaDangKy,
        approvalForm
      );

      if (response.success) {
        alert('Duyệt đăng ký thành công!');
        setLastApprovalResult(response.data);
        setShowRoomModal(false);
        setApprovalForm({ maPhong: '', maGiuong: '', ghiChu: '' });
        
        // Show fee calculation modal if available
        if (response.data.feeCalculation) {
          setShowFeeModal(true);
        }
        
        // Reload data
        loadRegistrations();
        loadStats();
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Có lỗi xảy ra khi duyệt đăng ký');
    } finally {
      setLoading(false);
    }
  };

  // Reject registration
  const rejectRegistration = async () => {
    if (!rejectForm.lyDoTuChoi.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn từ chối đăng ký này?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await registrationApprovalService.rejectRegistration(
        selectedRegistration.MaDangKy,
        rejectForm
      );

      if (response.success) {
        alert('Từ chối đăng ký thành công!');
        setShowRoomModal(false);
        setRejectForm({ lyDoTuChoi: '' });
        
        // Reload data
        loadRegistrations();
        loadStats();
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Có lỗi xảy ra khi từ chối đăng ký');
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'sinhVien',
      header: 'Sinh viên',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              row.GioiTinh === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'
            }`}>
              {row.HoTen.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.HoTen}
            </div>
            <div className="text-sm text-gray-500">
              {row.MaSinhVien}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'thongTin',
      header: 'Thông tin',
      render: (value, row) => (
        <div>
          <div className="text-sm text-gray-900">{row.Email}</div>
          <div className="text-sm text-gray-500">{row.SoDienThoai}</div>
        </div>
      )
    },
    {
      key: 'NgayNhanPhong',
      header: 'Ngày nhận phòng',
      render: (value, row) => new Date(row.NgayNhanPhong).toLocaleDateString('vi-VN')
    },
    {
      key: 'NguyenVong',
      header: 'Nguyện vọng',
      render: (value, row) => (
        <Badge variant="secondary">
          {row.NguyenVong}
        </Badge>
      )
    },
    {
      key: 'NgayKetThucHopDong',
      header: 'Hợp đồng đến',
      render: (value, row) => 
        row.NgayKetThucHopDong ? 
          new Date(row.NgayKetThucHopDong).toLocaleDateString('vi-VN') : 
          'Chưa xác định'
    },
    {
      key: 'TrangThai',
      header: 'Trạng thái',
      render: (value) => {
        let label = '';
        let colorClass = '';
        switch (value) {
          case 'CHO_DUYET':
            label = 'Chờ duyệt';
            colorClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'DA_DUYET':
            label = 'Đã duyệt';
            colorClass = 'bg-green-100 text-green-800';
            break;
          case 'TU_CHOI':
            label = 'Từ chối';
            colorClass = 'bg-red-100 text-red-800';
            break;
          default:
            label = value;
            colorClass = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{label}</span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (value, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => viewRegistrationDetail(row)}
          className={row.TrangThai === 'CHO_DUYET' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-600 hover:text-gray-800'}
        >
          <Eye className="h-4 w-4 mr-1" />
          {row.TrangThai === 'CHO_DUYET' ? 'Duyệt sinh viên' : 'Xem chi tiết'}
        </Button>
      )
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.trangThai ? `Quản lý đăng ký - ${filters.trangThai === 'CHO_DUYET' ? 'Chờ duyệt' : filters.trangThai === 'DA_DUYET' ? 'Đã duyệt' : filters.trangThai === 'TU_CHOI' ? 'Đã từ chối' : 'Tất cả'}` : 'Quản lý duyệt đăng ký'}
            </h1>
            <p className="text-gray-600">
              {filters.trangThai ? 'Xem và quản lý các đăng ký ký túc xá theo trạng thái' : 'Duyệt và quản lý các đăng ký ký túc xá của sinh viên'}
            </p>
          </div>
        </div>        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPending || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApproved || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRejected || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Nam / Nữ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {`${stats.genderStats?.male || 0} / ${stats.genderStats?.female || 0}`}
                </p>
              </div>
            </div>
          </Card>
        </div>        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã SV, tên, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.gioiTinh}
              onChange={(e) => handleFilterChange('gioiTinh', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            
            <Input
              placeholder="Nguyện vọng..."
              value={filters.nguyenVong}
              onChange={(e) => handleFilterChange('nguyenVong', e.target.value)}
            />
            
            <select
              value={filters.trangThai}
              onChange={(e) => handleFilterChange('trangThai', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="DA_DUYET">Đã duyệt</option>
              <option value="TU_CHOI">Đã từ chối</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({ search: '', gioiTinh: '', nguyenVong: '', trangThai: '' });
                setCurrentPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Card>

        {/* Registrations Table */}
        <Card>
          <Table
            data={registrations}
            columns={columns}
            loading={loading}
            emptyMessage="Không có đăng ký nào chờ duyệt"
          />
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="border-t"
            />
          )}
        </Card>
      </div>

        {/* Room Selection Modal */}
        <Modal
          isOpen={showRoomModal}
          onClose={() => setShowRoomModal(false)}
          title={`Duyệt đăng ký: ${selectedRegistration?.HoTen}`}
          size="lg"
        >
          {selectedRegistration && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                <h4 className="text-base font-medium text-blue-900 mb-4">
                  Thông tin sinh viên
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mã sinh viên:</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.MaSinhVien}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Họ tên:</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.HoTen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Giới tính:</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.GioiTinh}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nguyện vọng:</p>
                    <p className="font-medium text-gray-900">{selectedRegistration.NguyenVong}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ngày nhận phòng:</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRegistration.NgayNhanPhong).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Hợp đồng đến:</p>
                    <p className="font-medium text-gray-900">
                      {selectedRegistration.NgayKetThucHopDong ? 
                        new Date(selectedRegistration.NgayKetThucHopDong).toLocaleDateString('vi-VN') : 
                        'Chưa xác định'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Rooms */}
              {selectedRegistration.TrangThai === 'CHO_DUYET' ? (
                <>
                  {/* Phòng phù hợp */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      Phòng phù hợp ({availableRooms.length})
                    </h4>
                    {availableRooms.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
                        <p className="text-yellow-800 text-center">
                          Không có phòng trống phù hợp với giới tính {selectedRegistration.GioiTinh}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableRooms.map((room) => (
                          <Card key={room.MaPhong} className="p-6">
                            <div className="mb-4">
                              <h5 className="font-medium text-lg text-gray-900 mb-2">Phòng {room.SoPhong}</h5>
                              <p className="text-sm text-gray-600 mb-1">
                                {room.LoaiPhong} • {room.SucChua} giường • {room.availableBeds} trống
                              </p>
                              <p className="text-sm text-indigo-600 font-medium">
                                {parseFloat(room.GiaThueThang).toLocaleString('vi-VN')} VNĐ/tháng
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-3">Giường trống:</p>
                              <div className="flex flex-wrap gap-2">
                                {room.emptyBedDetails?.map((bed) => (
                                  <Button
                                    key={bed.MaGiuong}
                                    variant={approvalForm.maGiuong === bed.MaGiuong ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => selectRoomAndBed(room, bed)}
                                  >
                                    Giường {bed.SoGiuong}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Approval Form */}
                  {availableRooms.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-6">
                      <h4 className="text-base font-medium text-green-900 mb-4">
                        Duyệt đăng ký
                      </h4>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Ghi chú (tùy chọn)
                        </label>
                        <textarea
                          value={approvalForm.ghiChu}
                          onChange={(e) => setApprovalForm(prev => ({ ...prev, ghiChu: e.target.value }))}
                          placeholder="Nhập ghi chú nếu cần..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                          rows="3"
                        />
                      </div>
                      <Button
                        onClick={approveRegistration}
                        disabled={!approvalForm.maPhong || !approvalForm.maGiuong || loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loading ? 'Đang xử lý...' : 'Duyệt đăng ký'}
                      </Button>
                    </div>
                  )}
                  {/* Reject Form */}
                  <div className="bg-red-50 border border-red-200 rounded-md p-6">
                    <h4 className="text-base font-medium text-red-900 mb-4">
                      Từ chối đăng ký
                    </h4>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Lý do từ chối *
                      </label>
                      <textarea
                        value={rejectForm.lyDoTuChoi}
                        onChange={(e) => setRejectForm(prev => ({ ...prev, lyDoTuChoi: e.target.value }))}
                        placeholder="Nhập lý do từ chối đăng ký..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        rows="3"
                        required
                      />
                    </div>
                    <Button
                      onClick={rejectRegistration}
                      disabled={!rejectForm.lyDoTuChoi.trim() || loading}
                      variant="destructive"
                      className="w-full"
                    >
                      {loading ? 'Đang xử lý...' : 'Từ chối đăng ký'}
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </Modal>

      {/* Room Fee Calculation Modal */}
      <RoomFeeCalculationModal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        feeCalculation={lastApprovalResult?.feeCalculation}
        studentName={lastApprovalResult?.student?.HoTen}
      />
    </Layout>
  );
};

export default RegistrationApprovalPage;
