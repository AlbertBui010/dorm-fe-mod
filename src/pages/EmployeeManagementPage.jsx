import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Users,
  UserCheck,
  UserX,
  RefreshCcw,
} from "lucide-react";
import { employeeService } from "../services/api";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import { NHAN_VIEN_STATUS_FE } from "../constants/nhanVienFE";

// Constants
const PAGINATION_LIMIT = 10;
const INITIAL_FORM_DATA = {
  TenDangNhap: "",
  HoTen: "",
  Email: "",
  SoDienThoai: "",
  VaiTro: "NhanVien",
  MatKhau: "",
};

const ROLE_BADGE_STYLES = {
  QuanTriVien: "bg-red-100 text-red-800",
  QuanLy: "bg-blue-100 text-blue-800",
  NhanVien: "bg-green-100 text-green-800",
};

const STATUS_BADGE_STYLES = {
  [NHAN_VIEN_STATUS_FE.HOAT_DONG.key]: "bg-green-100 text-green-800",
  [NHAN_VIEN_STATUS_FE.KHOA.key]: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

// Utility functions
const getRoleBadgeClass = (role) => ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.NhanVien;

const getStatusBadgeClass = (status) => STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.default;

const getStatusLabel = (status) => {
  switch (status) {
    case NHAN_VIEN_STATUS_FE.HOAT_DONG.key:
      return "Hoạt động";
    case NHAN_VIEN_STATUS_FE.KHOA.key:
      return "Đã khóa";
    case NHAN_VIEN_STATUS_FE.DA_NGHI.key:
      return "Đã nghỉ";
    default:
      return "Không xác định";
  }
};

const handleApiError = (error, defaultMessage) => {
  console.error(error);
  toast.error(error.response?.data?.message || defaultMessage);
};

const createFormFieldUpdater = (setFormData) => (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stats, setStats] = useState({});
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [changePassword, setChangePassword] = useState(false);
  const [user, setUser] = useState(null);

  // Form data
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Form field updater
  const updateFormField = createFormFieldUpdater(setFormData);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setUser(JSON.parse(user));
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: PAGINATION_LIMIT,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { vaiTro: selectedRole }),
        ...(selectedStatus && { trangThai: selectedStatus }),
      };

      const response = await employeeService.getAll(params);
      if (response.success) {
        setEmployees(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRole, selectedStatus]);

  useEffect(() => {
    loadEmployees();
    loadStats();
    loadRoles();
  }, [loadEmployees]);

  const loadStats = async () => {
    try {
      const response = await employeeService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      handleApiError(error, "Không thể tải thống kê");
    }
  };

  const loadRoles = async () => {
    try {
      const response = await employeeService.getRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách vai trò");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await employeeService.create(formData);
      if (response.success) {
        handleCloseModal();
        loadEmployees();
        loadStats();
        toast.success("Thêm nhân viên thành công");
      }
    } catch (error) {
      handleApiError(error, "Không thể thêm nhân viên");
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
      if (formData.TrangThai) {
        if (selectedEmployee.MaNhanVien !== user.MaNhanVien) {
          payload.TrangThai = formData.TrangThai;
        }
      }

      const response = await employeeService.update(
        selectedEmployee.MaNhanVien,
        payload
      );
      if (response.success) {
        handleCloseModal();
        loadEmployees();
        toast.success("Cập nhật nhân viên thành công");
      }
    } catch (error) {
      handleApiError(error, "Không thể cập nhật nhân viên");
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  const togglePasswordChange = () => {
    setChangePassword(prev => !prev);
    if (!changePassword) {
      updateFormField('MatKhau', '');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedEmployee(null);
    setChangePassword(false);
    resetForm();
  };

  const resetFilter = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedStatus("");
    loadEmployees();
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedEmployee(null); // Clear selected employee for new entry
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
      TrangThai: employee.TrangThai,
    });
    setShowCreateModal(true);
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find((r) => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const columns = [
    {
      key: "MaNhanVien",
      header: "Mã NV",
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "HoTen",
      header: "Họ và tên",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "Email",
      header: "Email",
      render: (value) => <span className="text-blue-600">{value}</span>,
    },
    {
      key: "SoDienThoai",
      header: "Số điện thoại",
    },
    {
      key: "VaiTro",
      header: "Vai trò",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(value)}`}>
          {getRoleLabel(value)}
        </span>
      ),
    },
    {
      key: "TrangThai",
      header: "Trạng thái",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(row)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý nhân viên
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin nhân viên trong hệ thống
            </p>
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
                <p className="text-sm font-medium text-gray-600">
                  Tổng nhân viên
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã khóa</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.locked || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.roles?.[0]?.count || 0}
                </p>
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
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={NHAN_VIEN_STATUS_FE.HOAT_DONG.key}>
                {NHAN_VIEN_STATUS_FE.HOAT_DONG.value}
              </option>
              <option value={NHAN_VIEN_STATUS_FE.KHOA.key}>
                {NHAN_VIEN_STATUS_FE.KHOA.value}
              </option>
              <option value={NHAN_VIEN_STATUS_FE.DA_NGHI.key}>
                {NHAN_VIEN_STATUS_FE.DA_NGHI.value}
              </option>
            </select>
            <Button variant="outline" onClick={resetFilter}>
              <RefreshCcw className="w-4 h-4" />
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

        {/* Create/Edit Modal (dùng chung) */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={
            selectedEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"
          }
        >
          <form
            onSubmit={selectedEmployee ? handleEdit : handleCreate}
            className="space-y-4"
          >
            {/* Username luôn luôn render để hỗ trợ accessibility cho password form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <Input
                value={formData.TenDangNhap}
                onChange={(e) => updateFormField('TenDangNhap', e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                disabled={!!selectedEmployee}
                autoComplete="username"
                name="username"
              />
            </div>
            {/* Mật khẩu */}
            {(!selectedEmployee || changePassword) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  value={formData.MatKhau}
                  onChange={(e) => updateFormField('MatKhau', e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete={
                    selectedEmployee ? "current-password" : "new-password"
                  }
                />
              </div>
            )}
            {selectedEmployee && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    togglePasswordChange();
                  }}
                  className="mt-2"
                >
                  {changePassword ? "Không thay đổi" : "Thay đổi mật khẩu"}
                </Button>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <Input
                value={formData.HoTen}
                onChange={(e) => updateFormField('HoTen', e.target.value)}
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
                onChange={(e) => updateFormField('Email', e.target.value)}
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
                onChange={(e) => updateFormField('SoDienThoai', e.target.value)}
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
                onChange={(e) => updateFormField('VaiTro', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Chỉ hiển thị khi sửa */}
            {selectedEmployee && (
              <div>
                {/* Không cho phép chỉnh sửa trạng thái của chính mình */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                {selectedEmployee.MaNhanVien === user.MaNhanVien ? (
                  <div>
                    <p className="text-red-500 text-sm">
                      Không cho phép chỉnh sửa trạng thái của chính mình.
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.TrangThai}
                    onChange={(e) => updateFormField('TrangThai', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.values(NHAN_VIEN_STATUS_FE).map((status) => (
                      <option key={status.key} value={status.key}>
                        {status.value}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {selectedEmployee ? "Cập nhật" : "Thêm nhân viên"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default EmployeeManagementPage;
