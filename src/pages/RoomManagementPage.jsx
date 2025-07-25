import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Building,
  Users,
  MapPin,
  Bed,
} from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import roomService from "../services/api/roomService";
import { PHONG_STATUS_FE } from "../constants/phongFE";
import { formatCurrency } from "../utils/formatCurrency";

const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    loaiPhong: "",
    trangThai: "",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form state
  const [roomForm, setRoomForm] = useState({
    SoPhong: "",
    LoaiPhong: "Nam",
    SucChua: 4,
    DienTich: 20,
    GiaThueThang: 500000,
    MoTa: "",
    TrangThai: "HOAT_DONG",
  });

  const [errors, setErrors] = useState({});

  // Load rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters,
      };

      const response = await roomService.getAll(params);

      if (response.success) {
        setRooms(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.totalItems || 0,
        }));
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast.error("Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!roomForm.SoPhong.trim()) {
      newErrors.SoPhong = "Số phòng không được để trống";
    } else if (!/^[A-Z]\d{3}$/.test(roomForm.SoPhong)) {
      newErrors.SoPhong =
        "Số phòng phải có định dạng: 1 chữ cái in hoa + 3 số (VD: A101)";
    }

    if (roomForm.SucChua < 1 || roomForm.SucChua > 10) {
      newErrors.SucChua = "Sức chứa phải từ 1 đến 10 người";
    }

    if (roomForm.DienTich < 10 || roomForm.DienTich > 100) {
      newErrors.DienTich = "Diện tích phải từ 10 đến 100 m²";
    }

    if (roomForm.GiaThueThang < 0) {
      newErrors.GiaThueThang = "Giá phòng phải lớn hơn hoặc bằng 0";
    }

    if (roomForm.MoTa && roomForm.MoTa.length > 500) {
      newErrors.MoTa = "Mô tả không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create room
  const handleCreateRoom = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await roomService.create(roomForm);

      if (response.success) {
        toast.success("Tạo phòng thành công");
        setShowCreateModal(false);
        resetForm();
        loadRooms();
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo phòng");
    } finally {
      setLoading(false);
    }
  };

  // Handle update room
  const handleUpdateRoom = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await roomService.update(selectedRoom.MaPhong, roomForm);

      if (response.success) {
        toast.success("Cập nhật phòng thành công");
        setShowEditModal(false);
        resetForm();
        loadRooms();
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật phòng");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit room
  const handleEditRoom = async (room) => {
    try {
      setLoading(true);
      const response = await roomService.getById(room.MaPhong);

      if (response.success) {
        setSelectedRoom(response.data);
        setRoomForm({
          SoPhong: response.data.SoPhong,
          LoaiPhong: response.data.LoaiPhong,
          SucChua: response.data.SucChua,
          DienTich: response.data.DienTich,
          GiaThueThang: response.data.GiaThueThang,
          MoTa: response.data.MoTa || "",
          TrangThai: response.data.TrangThai,
        });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Error loading room details:", error);
      toast.error("Lỗi khi tải thông tin phòng");
    } finally {
      setLoading(false);
    }
  };

  // Handle view room details
  const handleViewRoom = async (room) => {
    try {
      setLoading(true);
      const response = await roomService.getById(room.MaPhong);

      if (response.success) {
        setSelectedRoom(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading room details:", error);
      toast.error("Lỗi khi tải thông tin phòng");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setRoomForm({
      SoPhong: "",
      LoaiPhong: "Nam",
      SucChua: 4,
      DienTich: 20,
      GiaThueThang: 500000,
      MoTa: "",
      TrangThai: PHONG_STATUS_FE.HOAT_DONG.key,
    });
    setErrors({});
    setSelectedRoom(null);
  };

  // Handle form input change
  const handleInputChange = (key, value) => {
    setRoomForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  // Get status badge
  const getStatusBadge = (status, currentCount = 0, capacity = 0) => {
    try {
      // Ensure we have valid values
      const safeStatus = String(status || "Hoạt động");
      const safeCurrentCount = Number(currentCount) || 0;
      const safeCapacity = Number(capacity) || 0;

      let statusText = safeStatus;
      let colorClass = "bg-green-100 text-green-800";

      if (safeStatus === "Bảo trì") {
        colorClass = "bg-yellow-100 text-yellow-800";
      } else if (safeStatus === "Đã đóng") {
        colorClass = "bg-red-100 text-red-800";
      } else if (safeCurrentCount >= safeCapacity && safeCapacity > 0) {
        statusText = "Đầy";
        colorClass = "bg-red-100 text-red-800";
      } else if (safeCurrentCount > 0) {
        statusText = `${safeCurrentCount}/${safeCapacity}`;
        colorClass = "bg-blue-100 text-blue-800";
      } else {
        statusText = "Trống";
        colorClass = "bg-green-100 text-green-800";
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {String(statusText)}
        </span>
      );
    } catch (error) {
      console.error("Error in getStatusBadge:", error);
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {String(status || "N/A")}
        </span>
      );
    }
  };

  // Table columns
  const columns = [
    {
      key: "SoPhong",
      title: "Số phòng",
      render: (value) => String(value || "N/A"),
    },
    {
      key: "LoaiPhong",
      title: "Loại phòng",
      render: (value) => String(value || "N/A"),
    },
    {
      key: "SucChua",
      title: "Sức chứa",
      render: (value) => `${Number(value) || 0} người`,
    },
    {
      key: "SoNguoiDangO",
      title: "Số người đang ở",
      render: (value, row) => {
        const currentCount = row.Giuongs
          ? row.Giuongs.filter((g) => g.DaCoNguoi).length
          : row.SoLuongHienTai || 0;
        const capacity = row.SucChua || 0;
        return getStatusBadge(row.TrangThai, currentCount, capacity);
      },
    },
    {
      key: "SoGiuongHienTai",
      title: "Số giường hiện tại",
      render: (_, row) => {
        const soGiuong = row.Giuongs ? row.Giuongs.length : 0;
        const sucChua = row.SucChua || 0;
        return `${soGiuong} / ${sucChua} Giường`;
      },
    },
    {
      key: "DienTich",
      title: "Diện tích",
      render: (value) => `${Number(value) || 0} m²`,
    },
    {
      key: "GiaThueThang",
      title: "Giá phòng",
      render: (value) => {
        try {
          return formatCurrency(value || 0);
        } catch (error) {
          console.error("Error formatting currency:", error);
          return String(value || "0 VNĐ");
        }
      },
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, room) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewRoom(room)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRoom(room)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý phòng
          </h1>
          <p className="text-gray-600">Quản lý thông tin phòng ở ký túc xá</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giường</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rooms.reduce(
                    (total, room) =>
                      total + (room.Giuongs ? room.Giuongs.length : 0),
                    0
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {rooms.reduce(
                    (total, room) =>
                      total +
                      (room.Giuongs
                        ? room.Giuongs.filter((g) => g.DaCoNguoi).length
                        : 0),
                    0
                  )}{" "}
                  đã có người
                </p>
              </div>
              <Bed className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phòng trống</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    rooms.filter((r) => {
                      const occupiedBeds = r.Giuongs
                        ? r.Giuongs.filter((g) => g.DaCoNguoi).length
                        : r?.SoLuongHienTai || 0;
                      return (
                        occupiedBeds === 0 &&
                        (r?.TrangThai || "Hoạt động") === "Hoạt động"
                      );
                    }).length
                  }
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phòng đầy</p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    rooms.filter((r) => {
                      const occupiedBeds = r.Giuongs
                        ? r.Giuongs.filter((g) => g.DaCoNguoi).length
                        : r?.SoLuongHienTai || 0;
                      return occupiedBeds >= (r?.SucChua || 0);
                    }).length
                  }
                </p>
              </div>
              <Users className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bảo trì</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    rooms.filter(
                      (r) => (r?.TrangThai || "Hoạt động") === "Bảo trì"
                    ).length
                  }
                </p>
              </div>
              <Building className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo số phòng..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full md:w-64"
                />
              </div>

              <select
                value={filters.loaiPhong}
                onChange={(e) =>
                  handleFilterChange("loaiPhong", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả loại phòng</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>

              <select
                value={filters.trangThai}
                onChange={(e) =>
                  handleFilterChange("trangThai", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Còn chỗ trống</option>
                <option value="full">Đầy</option>
              </select>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng mới
            </Button>
          </div>
        </Card>

        {/* Rooms Table */}
        <Card>
          <div className="p-4">
            <Table
              columns={columns}
              data={rooms}
              loading={loading}
              emptyMessage="Không có phòng nào"
            />

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.limit)}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, page }))
              }
              showInfo={true}
              className="border-t border-gray-200 mt-4"
            />
          </div>
        </Card>
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Thêm phòng mới"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng *
              </label>
              <Input
                type="text"
                value={roomForm.SoPhong}
                onChange={(e) =>
                  handleInputChange("SoPhong", e.target.value.toUpperCase())
                }
                placeholder="VD: A101"
                error={errors.SoPhong}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại phòng *
              </label>
              <select
                value={roomForm.LoaiPhong}
                onChange={(e) => handleInputChange("LoaiPhong", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sức chứa *
              </label>
              <Input
                type="number"
                value={roomForm.SucChua}
                onChange={(e) =>
                  handleInputChange("SucChua", parseInt(e.target.value) || 0)
                }
                min="1"
                max="10"
                error={errors.SucChua}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diện tích (m²) *
              </label>
              <Input
                type="number"
                value={roomForm.DienTich}
                onChange={(e) =>
                  handleInputChange("DienTich", parseFloat(e.target.value) || 0)
                }
                min="10"
                max="100"
                step="0.1"
                error={errors.DienTich}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá phòng (VNĐ) *
              </label>
              <Input
                type="number"
                value={roomForm.GiaThueThang}
                onChange={(e) =>
                  handleInputChange(
                    "GiaThueThang",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                error={errors.GiaThueThang}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={roomForm.TrangThai}
                onChange={(e) => handleInputChange("TrangThai", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PHONG_STATUS_FE.HOAT_DONG.key}>
                  {PHONG_STATUS_FE.HOAT_DONG.value}
                </option>
                <option value={PHONG_STATUS_FE.KHOA.key}>
                  {PHONG_STATUS_FE.KHOA.value}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={roomForm.MoTa}
              onChange={(e) => handleInputChange("MoTa", e.target.value)}
              placeholder="Mô tả thêm về phòng..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.MoTa && (
              <p className="mt-1 text-sm text-red-600">{errors.MoTa}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            Hủy
          </Button>
          <Button onClick={handleCreateRoom} loading={loading}>
            Tạo phòng
          </Button>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title={`Chỉnh sửa phòng ${selectedRoom?.SoPhong}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng *
              </label>
              <Input
                type="text"
                value={roomForm.SoPhong}
                onChange={(e) =>
                  handleInputChange("SoPhong", e.target.value.toUpperCase())
                }
                placeholder="VD: A101"
                error={errors.SoPhong}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại phòng *
              </label>
              <select
                value={roomForm.LoaiPhong}
                onChange={(e) => handleInputChange("LoaiPhong", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sức chứa *
              </label>
              <Input
                type="number"
                value={roomForm.SucChua}
                onChange={(e) =>
                  handleInputChange("SucChua", parseInt(e.target.value) || 0)
                }
                min="1"
                max="10"
                error={errors.SucChua}
              />
              {selectedRoom &&
                (selectedRoom.Giuongs
                  ? selectedRoom.Giuongs.filter((g) => g.DaCoNguoi).length
                  : selectedRoom.SoLuongHienTai || 0) > 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    Lưu ý: Phòng hiện có{" "}
                    {selectedRoom.Giuongs
                      ? selectedRoom.Giuongs.filter((g) => g.DaCoNguoi).length
                      : selectedRoom.SoLuongHienTai || 0}{" "}
                    người đang ở
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diện tích (m²) *
              </label>
              <Input
                type="number"
                value={roomForm.DienTich}
                onChange={(e) =>
                  handleInputChange("DienTich", parseFloat(e.target.value) || 0)
                }
                min="10"
                max="100"
                step="0.1"
                error={errors.DienTich}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá phòng (VNĐ) *
              </label>
              <Input
                type="number"
                value={roomForm.GiaThueThang}
                onChange={(e) =>
                  handleInputChange(
                    "GiaThueThang",
                    parseFloat(e.target.value) || 0
                  )
                }
                min="0"
                error={errors.GiaThueThang}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={roomForm.TrangThai}
                onChange={(e) => handleInputChange("TrangThai", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PHONG_STATUS_FE.HOAT_DONG.key}>
                  {PHONG_STATUS_FE.HOAT_DONG.value}
                </option>
                <option value={PHONG_STATUS_FE.KHOA.key}>
                  {PHONG_STATUS_FE.KHOA.value}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={roomForm.MoTa}
              onChange={(e) => handleInputChange("MoTa", e.target.value)}
              placeholder="Mô tả thêm về phòng..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.MoTa && (
              <p className="mt-1 text-sm text-red-600">{errors.MoTa}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
          >
            Hủy
          </Button>
          <Button onClick={handleUpdateRoom} loading={loading}>
            Cập nhật
          </Button>
        </div>
      </Modal>

      {/* Room Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRoom(null);
        }}
        title={`Chi tiết phòng ${selectedRoom?.SoPhong}`}
        size="xl"
      >
        {selectedRoom && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thông tin cơ bản
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số phòng:</span>
                    <span className="font-medium">{selectedRoom.SoPhong}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại phòng:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedRoom.LoaiPhong === "Nam"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {selectedRoom.LoaiPhong}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sức chứa:</span>
                    <span className="font-medium">
                      {selectedRoom.SucChua} người
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượng hiện tại:</span>
                    <span className="font-medium">
                      {selectedRoom.Giuongs
                        ? selectedRoom.Giuongs.filter((g) => g.DaCoNguoi).length
                        : selectedRoom.SoLuongHienTai || 0}{" "}
                      người
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số giường hiện tại:</span>
                    <span className="font-medium">
                      {selectedRoom.Giuongs ? selectedRoom.Giuongs.length : 0} /{" "}
                      {selectedRoom.SucChua}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diện tích:</span>
                    <span className="font-medium">
                      {selectedRoom.DienTich} m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá phòng:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedRoom.GiaThueThang)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thông tin giường
                </h3>

                {selectedRoom.Giuongs && selectedRoom.Giuongs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.Giuongs.map((giuong) => (
                      <div
                        key={giuong.MaGiuong}
                        className={`p-3 rounded-lg border ${
                          giuong.DaCoNguoi
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {giuong.SoGiuong}
                        </div>
                        <div className="text-xs text-gray-600">
                          {giuong.DaCoNguoi ? "Đã có người" : "Trống"}
                        </div>
                        {giuong.SinhVien && (
                          <div className="text-xs text-blue-600 mt-1">
                            {giuong.SinhVien.HoTen}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Chưa có thông tin giường
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedRoom.MoTa && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mô tả
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedRoom.MoTa}
                </p>
              </div>
            )}

            {/* Creation/Update Info */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(selectedRoom.NgayTao).toLocaleString("vi-VN")}
                  <br />
                  <strong>Người tạo:</strong> {selectedRoom.NguoiTao}
                </div>
                {selectedRoom.NgayCapNhat && (
                  <div>
                    <strong>Ngày cập nhật:</strong>{" "}
                    {new Date(selectedRoom.NgayCapNhat).toLocaleString("vi-VN")}
                    <br />
                    <strong>Người cập nhật:</strong> {selectedRoom.NguoiCapNhat}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default RoomManagementPage;
