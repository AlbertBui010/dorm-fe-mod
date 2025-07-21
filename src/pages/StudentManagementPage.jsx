import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit2, Lock, Unlock, Trash2, Eye, Users, UserCheck, UserX, Mail, Phone, Calendar, User } from 'lucide-react';
import { studentService } from '../services/api';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [relatedRecords, setRelatedRecords] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    MaSinhVien: '',
    HoTen: '',
    NgaySinh: '',
    GioiTinh: 'Nam',
    SoDienThoai: '',
    Email: '',
    MatKhau: '',
    EmailDaXacThuc: false,
    TrangThai: 'HoatDong'
  });

  useEffect(() => {
    loadStudents();
    loadStats();
  }, [currentPage, searchTerm, selectedGender, selectedStatus]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGender && { gioiTinh: selectedGender }),
        ...(selectedStatus && { trangThai: selectedStatus }),
      };

      const response = await studentService.getAll(params);
      if (response.success) {
        setStudents(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await studentService.getStats();
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      MaSinhVien: '',
      HoTen: '',
      NgaySinh: '',
      GioiTinh: 'Nam',
      SoDienThoai: '',
      Email: '',
      MatKhau: '',
      EmailDaXacThuc: false,
      TrangThai: 'HoatDong'
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Search and filter handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleGenderFilter = (e) => {
    setSelectedGender(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  // CRUD operations
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await studentService.create(formData);
      if (response.success) {
        toast.success('Tạo sinh viên thành công');
        setShowCreateModal(false);
        resetForm();
        loadStudents();
        loadStats();
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo sinh viên');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // Exclude MaSinhVien from update data
      const { MaSinhVien, ...updateData } = formData;
      
      // Remove MatKhau if it's empty (don't want to change password)
      if (!updateData.MatKhau || updateData.MatKhau.trim() === '') {
        delete updateData.MatKhau;
      }
      
      const response = await studentService.update(selectedStudent.MaSinhVien, updateData);
      if (response.success) {
        toast.success('Cập nhật sinh viên thành công');
        setShowEditModal(false);
        resetForm();
        setSelectedStudent(null);
        loadStudents();
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sinh viên');
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const response = await studentService.toggleStatus(student.MaSinhVien);
      if (response.success) {
        toast.success(`${student.TrangThai === 'HoatDong' ? 'Vô hiệu hóa' : 'Kích hoạt'} sinh viên thành công`);
        loadStudents();
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling student status:', error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái sinh viên');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await studentService.delete(selectedStudent.MaSinhVien);
      if (response.success) {
        toast.success('Xóa sinh viên thành công');
        setShowDeleteModal(false);
        setSelectedStudent(null);
        setRelatedRecords(null);
        loadStudents();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa sinh viên');
    }
  };

  const checkRelatedRecords = async (student) => {
    try {
      const response = await studentService.checkRelatedRecords(student.MaSinhVien);
      if (response.success) {
        setRelatedRecords(response.data);
        setSelectedStudent(student);
        setShowDeleteModal(true);
      }
    } catch (error) {
      console.error('Error checking related records:', error);
      toast.error('Có lỗi xảy ra khi kiểm tra dữ liệu liên quan');
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      MaSinhVien: student.MaSinhVien,
      HoTen: student.HoTen,
      NgaySinh: student.NgaySinh || '',
      GioiTinh: student.GioiTinh || 'Nam',
      SoDienThoai: student.SoDienThoai || '',
      Email: student.Email || '',
      MatKhau: '', // Don't populate password
      EmailDaXacThuc: student.EmailDaXacThuc || false,
      TrangThai: student.TrangThai || 'HoatDong'
    });
    setShowEditModal(true);
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedStudent(null);
    setRelatedRecords(null);
    resetForm();
  };

  // Table columns
  const columns = [
    {
      key: 'MaSinhVien',
      header: 'Mã SV',
      render: (value, row) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'HoTen',
      header: 'Họ tên',
      render: (value, row) => <span className="font-medium">{value}</span>
    },
    {
      key: 'GioiTinh',
      header: 'Giới tính',
      render: (value, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Nam' ? 'bg-blue-100 text-blue-800' :
          value === 'Nữ' ? 'bg-pink-100 text-pink-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'Email',
      header: 'Email',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{value || 'Chưa có'}</span>
          {row.EmailDaXacThuc && (
            <span className="text-green-500" title="Email đã xác thực">
              <Mail className="h-4 w-4" />
            </span>
          )}
        </div>
      )
    },
    {
      key: 'SoDienThoai',
      header: 'Số ĐT',
      render: (value, row) => value || 'Chưa có'
    },
    {
      key: 'TrangThai',
      header: 'Trạng thái',
      render: (value, row) => {
        let label = '';
        let colorClass = '';

        switch (value) {
          case 'DANG_O':
            label = 'Đang ở';
            colorClass = 'bg-green-100 text-green-800';
            break;
          case 'NGUNG_O':
            label = 'Ngưng ở';
            colorClass = 'bg-red-100 text-red-800';
            break;
          case 'CHO_DUYET':
            label = 'Chờ duyệt';
            colorClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'DANG_KY':
            label = 'Đăng ký mới';
            colorClass = 'bg-blue-100 text-blue-800';
            break;
          case 'HoatDong':
            label = 'Hoạt động';
            colorClass = 'bg-green-100 text-green-800';
            break;
          case 'KhongHoatDong':
            label = 'Không hoạt động';
            colorClass = 'bg-red-100 text-red-800';
            break;
          default:
            label = value;
            colorClass = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openViewModal(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row)}
            className={row.TrangThai === 'HoatDong' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
          >
            {row.TrangThai === 'HoatDong' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkRelatedRecords(row)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Sinh viên</h1>
            <p className="text-gray-600">Quản lý thông tin sinh viên trong hệ thống</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sinh viên
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Email đã xác thực</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã SV, tên, email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedGender}
              onChange={handleGenderFilter}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DANG_O">Đang ở</option>
              <option value="NGUNG_O">Ngưng ở</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="DANG_KY">Đăng ký mới</option>
              <option value="HoatDong">Hoạt động</option>
              <option value="KhongHoatDong">Không hoạt động</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedGender('');
                setSelectedStatus('');
                setCurrentPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            data={students}
            columns={columns}
            loading={loading}
            emptyMessage="Không có sinh viên nào"
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

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={closeModals}
          title="Thêm sinh viên mới"
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sinh viên <span className="text-red-500">*</span>
                </label>
                <Input
                  name="MaSinhVien"
                  value={formData.MaSinhVien}
                  onChange={handleInputChange}
                  placeholder="VD: DH12345678"
                  required
                  maxLength={10}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <Input
                  name="HoTen"
                  value={formData.HoTen}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  name="NgaySinh"
                  value={formData.NgaySinh}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  name="GioiTinh"
                  value={formData.GioiTinh}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <Input
                  name="SoDienThoai"
                  value={formData.SoDienThoai}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu (tùy chọn)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="TrangThai"
                  value={formData.TrangThai}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HoatDong">Hoạt động</option>
                  <option value="KhongHoatDong">Không hoạt động</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="EmailDaXacThuc"
                checked={formData.EmailDaXacThuc}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Email đã được xác thực
              </label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModals}>
                Hủy
              </Button>
              <Button type="submit">
                Thêm sinh viên
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={closeModals}
          title="Chỉnh sửa sinh viên"
          size="lg"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sinh viên
                </label>
                <Input
                  name="MaSinhVien"
                  value={formData.MaSinhVien}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Mã sinh viên không thể thay đổi</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <Input
                  name="HoTen"
                  value={formData.HoTen}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  name="NgaySinh"
                  value={formData.NgaySinh}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  name="GioiTinh"
                  value={formData.GioiTinh}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <Input
                  name="SoDienThoai"
                  value={formData.SoDienThoai}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <Input
                  type="password"
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleInputChange}
                  placeholder="Để trống nếu không đổi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="TrangThai"
                  value={formData.TrangThai}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HoatDong">Hoạt động</option>
                  <option value="KhongHoatDong">Không hoạt động</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="EmailDaXacThuc"
                checked={formData.EmailDaXacThuc}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Email đã được xác thực
              </label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModals}>
                Hủy
              </Button>
              <Button type="submit">
                Cập nhật
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={closeModals}
          title="Thông tin sinh viên"
          size="lg"
        >
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mã sinh viên</label>
                    <p className="text-lg font-mono">{selectedStudent.MaSinhVien}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Họ tên</label>
                    <p className="text-lg font-medium">{selectedStudent.HoTen}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày sinh</label>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {selectedStudent.NgaySinh ? new Date(selectedStudent.NgaySinh).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Giới tính</label>
                    <p className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {selectedStudent.GioiTinh || 'Chưa xác định'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedStudent.Email || 'Chưa có'}
                      {selectedStudent.EmailDaXacThuc && (
                        <span className="text-green-500 text-sm">(Đã xác thực)</span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Số điện thoại</label>
                    <p className="text-lg flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedStudent.SoDienThoai || 'Chưa có'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedStudent.TrangThai === 'HoatDong' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStudent.TrangThai === 'HoatDong' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="text-lg">
                      {selectedStudent.NgayTao ? new Date(selectedStudent.NgayTao).toLocaleString('vi-VN') : 'Chưa có'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModals}>
                  Đóng
                </Button>
                <Button onClick={() => {
                  closeModals();
                  openEditModal(selectedStudent);
                }}>
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={closeModals}
          title="Xóa sinh viên"
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Cảnh báo xóa sinh viên
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Bạn có chắc chắn muốn xóa sinh viên <strong>{selectedStudent.HoTen}</strong> (Mã SV: {selectedStudent.MaSinhVien})?</p>
                    </div>
                  </div>
                </div>
              </div>

              {relatedRecords && relatedRecords.hasRelatedRecords && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Không thể xóa sinh viên
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Sinh viên này còn có dữ liệu liên quan trong các bảng: <strong>{relatedRecords.relatedTables.join(', ')}</strong></p>
                        <p className="mt-1">Vui lòng xóa hoặc chuyển đổi dữ liệu liên quan trước khi xóa sinh viên.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModals}>
                  Hủy
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={relatedRecords && relatedRecords.hasRelatedRecords}
                >
                  Xóa sinh viên
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default StudentManagementPage;
