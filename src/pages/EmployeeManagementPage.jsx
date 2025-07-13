import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit2, Lock, Unlock, Trash2, Eye, Users, UserCheck, UserX } from 'lucide-react';
import { employeeService } from '../services/api';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stats, setStats] = useState({});
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    TenDangNhap: '',
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    VaiTro: 'NhanVien',
    MatKhau: ''
  });

  useEffect(() => {
    loadEmployees();
    loadStats();
    loadRoles();
  }, [currentPage, searchTerm, selectedRole, selectedStatus]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { vaiTro: selectedRole }),
        ...(selectedStatus && { trangThai: selectedStatus })
      };
      
      const response = await employeeService.getAll(params);
      if (response.success) {
        setEmployees(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await employeeService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await employeeService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await employeeService.create(formData);
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        loadEmployees();
        loadStats();
        toast.success('Thêm nhân viên thành công');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Không thể thêm nhân viên');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      
      if (formData.TenDangNhap) payload.TenDangNhap = formData.TenDangNhap;
      if (formData.HoTen) payload.HoTen = formData.HoTen;
      if (formData.Email) payload.Email = formData.Email;
      if (formData.SoDienThoai) payload.SoDienThoai = formData.SoDienThoai;
      if (formData.VaiTro) payload.VaiTro = formData.VaiTro;
      
      const response = await employeeService.update(selectedEmployee.MaNhanVien, payload);
      if (response.success) {
        setShowEditModal(false);
        resetForm();
        loadEmployees();
        toast.success('Cập nhật nhân viên thành công');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Không thể cập nhật nhân viên');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await employeeService.delete(selectedEmployee.MaNhanVien);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedEmployee(null);
        loadEmployees();
        loadStats();
        toast.success('Xóa nhân viên thành công');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Không thể xóa nhân viên');
    }
  };

  const handleToggleStatus = async (employee) => {
    try {
      const response = await employeeService.toggleStatus(employee.MaNhanVien);
      if (response.success) {
        loadEmployees();
        loadStats();
        toast.success(`${employee.TrangThai === 'HoatDong' ? 'Khóa' : 'Mở khóa'} nhân viên thành công`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Không thể thay đổi trạng thái nhân viên');
    }
  };

  const resetForm = () => {
    setFormData({
      TenDangNhap: '',
      HoTen: '',
      Email: '',
      SoDienThoai: '',
      VaiTro: 'NhanVien',
      MatKhau: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      TenDangNhap: employee.TenDangNhap,
      HoTen: employee.HoTen,
      Email: employee.Email,
      SoDienThoai: employee.SoDienThoai,
      VaiTro: employee.VaiTro,
      MatKhau: ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const columns = [
    {
      key: 'MaNhanVien',
      header: 'Mã NV',
      render: (value, row) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'HoTen', 
      header: 'Họ và tên',
      render: (value, row) => <span className="font-medium">{value}</span>
    },
    {
      key: 'Email',
      header: 'Email',
      render: (value, row) => <span className="text-blue-600">{value}</span>
    },
    {
      key: 'SoDienThoai',
      header: 'Số điện thoại'
    },
    {
      key: 'VaiTro',
      header: 'Vai trò',
      render: (value, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'QuanTriVien' ? 'bg-red-100 text-red-800' :
          value === 'QuanLy' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {getRoleLabel(value)}
        </span>
      )
    },
    {
      key: 'TrangThai',
      header: 'Trạng thái',
      render: (value, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'HoatDong' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'HoatDong' ? 'Hoạt động' : 'Đã khóa'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(row)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(row)}
          >
            {row?.TrangThai === 'HoatDong' ? 
              <Lock className="w-4 h-4" /> : 
              <Unlock className="w-4 h-4" />
            }
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDeleteModal(row)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="text-gray-600">Quản lý thông tin nhân viên trong hệ thống</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
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
              <p className="text-sm font-medium text-gray-600">Đã khóa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.locked || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admin</p>
               <p className="text-2xl font-bold text-gray-900">{stats?.roles?.[0]?.count || 0}</p>
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
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="HoatDong">Hoạt động</option>
            <option value="Khoa">Đã khóa</option>
          </select>
          <Button variant="outline" onClick={loadEmployees}>
            Lọc
          </Button>
        </div>
      </Card>

      {/* Employee Table */}
      <Card>
        <Table
          columns={columns}
          data={employees}
          loading={loading}
          emptyMessage="Không có nhân viên nào"
        />
        
        {/* Pagination */}
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
        onClose={() => setShowCreateModal(false)}
        title="Thêm nhân viên mới"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <Input
              value={formData.TenDangNhap}
              onChange={(e) => setFormData({...formData, TenDangNhap: e.target.value})}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <Input
              type="password"
              value={formData.MatKhau}
              onChange={(e) => setFormData({...formData, MatKhau: e.target.value})}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <Input
              value={formData.HoTen}
              onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({...formData, Email: e.target.value})}
              placeholder="Nhập email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <Input
              value={formData.SoDienThoai}
              onChange={(e) => setFormData({...formData, SoDienThoai: e.target.value})}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              value={formData.VaiTro}
              onChange={(e) => setFormData({...formData, VaiTro: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Thêm nhân viên
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa nhân viên"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <Input
              value={formData.TenDangNhap}
              onChange={(e) => setFormData({...formData, TenDangNhap: e.target.value})}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <Input
              value={formData.HoTen}
              onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({...formData, Email: e.target.value})}
              placeholder="Nhập email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <Input
              value={formData.SoDienThoai}
              onChange={(e) => setFormData({...formData, SoDienThoai: e.target.value})}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              value={formData.VaiTro}
              onChange={(e) => setFormData({...formData, VaiTro: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Cập nhật
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa nhân viên <strong>{selectedEmployee?.HoTen}</strong>?
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Xóa
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </Layout>
  );
};

export default EmployeeManagementPage;
