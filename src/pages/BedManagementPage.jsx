import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, Bed, Users, UserCheck, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import Card  from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { bedService } from '../services/api/bedService';
import { roomService } from '../services/api/roomService';
import { studentService } from '../services/api/studentService';

const BedManagementPage = () => {
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    MaPhong: '',
    SoGiuong: '',
    ViTri: '',
    TrangThai: 'Hoạt động',
    GhiChu: ''
  });
  
  const [assignData, setAssignData] = useState({
    maSinhVien: ''
  });

  // Fetch data
  useEffect(() => {
    fetchBeds();
    fetchRooms();
    fetchStudents();
  }, [currentPage, searchTerm, selectedRoom, statusFilter]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRoom && { maPhong: selectedRoom }),
        ...(statusFilter && { trangThai: statusFilter })
      };
      
      const response = await bedService.getAllBeds(params);
      setBeds(response.data || []);
      
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching beds:', err);
      setError('Lỗi khi tải danh sách giường');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAll({ limit: 100 });
      setRooms(response.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll({ limit: 100 });
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // CRUD operations
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await bedService.createBed(formData);
      setShowCreateModal(false);
      resetForm();
      fetchBeds();
      toast.success('Tạo giường thành công!');
    } catch (err) {
      console.error('Error creating bed:', err);
      toast.error('Lỗi khi tạo giường: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await bedService.updateBed(selectedBed.MaGiuong, formData);
      setShowEditModal(false);
      resetForm();
      fetchBeds();
      toast.success('Cập nhật giường thành công!');
    } catch (err) {
      console.error('Error updating bed:', err);
      toast.error('Lỗi khi cập nhật giường: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (maGiuong) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giường này?')) return;
    
    try {
      await bedService.deleteBed(maGiuong);
      fetchBeds();
      toast.success('Xóa giường thành công!');
    } catch (err) {
      console.error('Error deleting bed:', err);
      toast.error('Lỗi khi xóa giường: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await bedService.assignStudentToBed(selectedBed.MaGiuong, assignData);
      setShowAssignModal(false);
      setAssignData({ maSinhVien: '' });
      fetchBeds();
      toast.success('Gán sinh viên vào giường thành công!');
    } catch (err) {
      console.error('Error assigning student:', err);
      toast.error('Lỗi khi gán sinh viên: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveStudent = async (maGiuong) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ sinh viên khỏi giường này?')) return;
    
    try {
      await bedService.removeStudentFromBed(maGiuong);
      fetchBeds();
      toast.success('Gỡ sinh viên khỏi giường thành công!');
    } catch (err) {
      console.error('Error removing student:', err);
      toast.error('Lỗi khi gỡ sinh viên: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      MaPhong: '',
      SoGiuong: '',
      ViTri: '',
      TrangThai: 'Hoạt động',
      GhiChu: ''
    });
    setSelectedBed(null);
  };

  const openEditModal = (bed) => {
    setSelectedBed(bed);
    setFormData({
      MaPhong: bed.MaPhong,
      SoGiuong: bed.SoGiuong,
      ViTri: bed.ViTri || '',
      TrangThai: bed.TrangThai || 'Hoạt động',
      GhiChu: bed.GhiChu || ''
    });
    setShowEditModal(true);
  };

  const openAssignModal = (bed) => {
    setSelectedBed(bed);
    setShowAssignModal(true);
  };

  // Table columns
  const columns = [
    {
      key: 'MaGiuong',
      title: 'Mã Giường',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'SoGiuong',
      title: 'Số Giường',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'Phong',
      title: 'Phòng',
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.Phong?.SoPhong}</div>
          <div className="text-sm text-gray-500">{row.Phong?.LoaiPhong}</div>
        </div>
      )
    },
    {
      key: 'ViTri',
      title: 'Vị Trí',
      render: (value) => value || 'Chưa xác định'
    },
    {
      key: 'DaCoNguoi',
      title: 'Trạng Thái',
      render: (value, row) => (
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {value ? 'Đã có người' : 'Trống'}
          </span>
          {row.SinhVien && (
            <div className="text-sm text-gray-600 mt-1">
              {row.SinhVien.HoTen}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'TrangThai',
      title: 'Hoạt Động',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Hoạt động' ? 'bg-blue-100 text-blue-800' :
          value === 'Bảo trì' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao Tác',
      render: (value, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(row)}
          >
            Sửa
          </Button>
          {!row.DaCoNguoi ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openAssignModal(row)}
            >
              Gán SV
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleRemoveStudent(row.MaGiuong)}
            >
              Gỡ SV
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.MaGiuong)}
          >
            Xóa
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý giường</h1>
          <p className="text-gray-600">Quản lý thông tin giường ở ký túc xá</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giường</p>
                <p className="text-2xl font-bold text-gray-900">{beds.length}</p>
              </div>
              <Bed className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Giường trống</p>
                <p className="text-2xl font-bold text-green-600">
                  {beds.filter(bed => !bed.DaCoNguoi).length}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã có người</p>
                <p className="text-2xl font-bold text-red-600">
                  {beds.filter(bed => bed.DaCoNguoi).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bảo trì</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {beds.filter(bed => bed.TrangThai === 'Bảo trì').length}
                </p>
              </div>
              <Bed className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters and Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm giường..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">Tất cả phòng</option>
                {rooms.map(room => (
                  <option key={room.MaPhong} value={room.MaPhong}>
                    {room.SoPhong} - {room.LoaiPhong}
                  </option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Giường trống</option>
                <option value="occupied">Đã có người</option>
              </select>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm giường mới
            </Button>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedRoom('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Xóa bộ lọc
            </Button>
          </div>
        </Card>

      {/* Table */}
      <Card>
        <Table 
          data={beds} 
          columns={columns}
          loading={loading}
          emptyMessage="Không có giường nào"
        />
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showInfo={true}
          className="border-t border-gray-200"
        />
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Thêm Giường Mới"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phòng
            </label>
            <select
              name="MaPhong"
              value={formData.MaPhong}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn phòng</option>
              {rooms.map(room => (
                <option key={room.MaPhong} value={room.MaPhong}>
                  {room.SoPhong} - {room.LoaiPhong}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Số Giường"
            name="SoGiuong"
            value={formData.SoGiuong}
            onChange={handleInputChange}
            placeholder="1"
            required
          />
          <Input
            label="Vị Trí"
            name="ViTri"
            value={formData.ViTri}
            onChange={handleInputChange}
            placeholder="Gần cửa sổ"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              name="TrangThai"
              value={formData.TrangThai}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Hoạt động">Hoạt động</option>
              <option value="Không hoạt động">Không hoạt động</option>
              <option value="Bảo trì">Bảo trì</option>
            </select>
          </div>
          <Input
            label="Ghi Chú"
            name="GhiChu"
            value={formData.GhiChu}
            onChange={handleInputChange}
            placeholder="Ghi chú thêm..."
          />
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button type="submit">Tạo Giường</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Chỉnh Sửa Giường"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Mã Giường"
            name="MaGiuong"
            value={formData.MaGiuong}
            onChange={handleInputChange}
            disabled
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phòng
            </label>
            <select
              name="MaPhong"
              value={formData.MaPhong}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn phòng</option>
              {rooms.map(room => (
                <option key={room.MaPhong} value={room.MaPhong}>
                  {room.SoPhong} - {room.LoaiPhong}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Số Giường"
            name="SoGiuong"
            value={formData.SoGiuong}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Vị Trí"
            name="ViTri"
            value={formData.ViTri}
            onChange={handleInputChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              name="TrangThai"
              value={formData.TrangThai}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Hoạt động">Hoạt động</option>
              <option value="Không hoạt động">Không hoạt động</option>
              <option value="Bảo trì">Bảo trì</option>
            </select>
          </div>
          <Input
            label="Ghi Chú"
            name="GhiChu"
            value={formData.GhiChu}
            onChange={handleInputChange}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button type="submit">Cập Nhật</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Student Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssignData({ maSinhVien: '' });
        }}
        title={`Gán Sinh Viên - Giường ${selectedBed?.SoGiuong}`}
      >
        <form onSubmit={handleAssignStudent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sinh Viên
            </label>
            <select
              name="maSinhVien"
              value={assignData.maSinhVien}
              onChange={handleAssignInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn sinh viên</option>
              {students.map(student => (
                <option key={student.MaSinhVien} value={student.MaSinhVien}>
                  {student.MaSinhVien} - {student.HoTen}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowAssignModal(false);
                setAssignData({ maSinhVien: '' });
              }}
            >
              Hủy
            </Button>
            <Button type="submit">Gán Sinh Viên</Button>
          </div>
        </form>
      </Modal>
      </div>
    </Layout>
  );
};

export default BedManagementPage;
