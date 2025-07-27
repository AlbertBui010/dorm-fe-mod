import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Bed,
  UserCheck,
  MapPin,
  Building,
} from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { bedService } from "../services/api/bedService";
import { roomService } from "../services/api/roomService";
import { studentService } from "../services/api/studentService";
import { GIUONG_STATUS } from "../constants/giuongFe";

const BedManagementPage = () => {
  const [beds, setBeds] = useState([]);
  const [allBeds, setAllBeds] = useState([]); // Store all beds for room capacity check
  const [rooms, setRooms] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    MaGiuong: "",
    MaPhong: "",
    SoGiuong: "",
    TrangThai: "HOAT_DONG",
  });

  const [assignData, setAssignData] = useState({
    maSinhVien: "",
  });

  // Helper function to check if room is full
  const isRoomFull = () => {
    if (!selectedRoom) return false;
    const selectedRoomData = rooms.find(
      (room) => room.MaPhong.toString() === selectedRoom.toString()
    );
    if (!selectedRoomData) return false;

    const totalBedsForRoom = allBeds.length;
    const roomCapacity = selectedRoomData.SucChua || 0;

    return totalBedsForRoom >= roomCapacity;
  };

  // Helper function to get selected room info
  const getSelectedRoomInfo = () => {
    if (!selectedRoom) return null;
    return rooms.find(
      (room) => room.MaPhong.toString() === selectedRoom.toString()
    );
  };

  // Fetch data
  useEffect(() => {
    fetchBeds();
    fetchRooms();
  }, [currentPage, searchTerm, selectedRoom, statusFilter]);

  const fetchBeds = async () => {
    try {
      setLoading(true);

      // Fetch all beds for the selected room (for capacity check)
      let allBedsParams = {};
      if (selectedRoom) {
        allBedsParams = { maPhong: selectedRoom };
      }
      const allBedsResponse = await bedService.getAllBeds(allBedsParams);
      setAllBeds(allBedsResponse.data || []);

      // Fetch filtered beds for display
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRoom && { maPhong: selectedRoom }),
        ...(statusFilter && { trangThai: statusFilter }),
      };

      const response = await bedService.getAllBeds(params);
      setBeds(response.data || []);

      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      console.error("Error fetching beds:", err);
      setError("Lỗi khi tải danh sách giường");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAll({ limit: 100 });
      setRooms(response.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const fetchAvailableStudents = async (roomType) => {
    try {
      const response = await studentService.getWithoutBed(roomType);
      setAvailableStudents(response.data || []);
    } catch (err) {
      console.error("Error fetching available students:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset SoGiuong when MaPhong changes
    if (name === "MaPhong") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        SoGiuong: "",
      }));
    }
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await bedService.createBed(formData);
      setShowCreateModal(false);
      resetForm();
      fetchBeds();
      toast.success("Tạo giường thành công!");
    } catch (err) {
      console.error("Error creating bed:", err);
      toast.error(
        "Lỗi khi tạo giường: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Chỉ update trạng thái
      await bedService.updateBed(selectedBed.MaGiuong, {
        TrangThai: formData.TrangThai,
      });
      setShowCreateModal(false);
      resetForm();
      fetchBeds();
      toast.success("Cập nhật trạng thái giường thành công!");
    } catch (err) {
      console.error("Error updating bed:", err);
      toast.error(
        "Lỗi khi cập nhật trạng thái giường: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await bedService.assignStudentToBed(selectedBed.MaGiuong, assignData);
      setShowAssignModal(false);
      setAssignData({ maSinhVien: "" });
      fetchBeds();
      toast.success("Gán sinh viên vào giường thành công!");
    } catch (err) {
      console.error("Error assigning student:", err);
      toast.error(
        "Lỗi khi gán sinh viên: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleRemoveStudent = async (maGiuong) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ sinh viên khỏi giường này?"))
      return;

    try {
      await bedService.removeStudentFromBed(maGiuong);
      fetchBeds();
      toast.success("Gỡ sinh viên khỏi giường thành công!");
    } catch (err) {
      console.error("Error removing student:", err);
      toast.error(
        "Lỗi khi gỡ sinh viên: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      MaGiuong: "",
      MaPhong: "",
      SoGiuong: "",
      TrangThai: "HOAT_DONG",
    });
    setSelectedBed(null);
  };

  const openEditModal = (bed) => {
    setSelectedBed(bed);
    setFormData({
      MaGiuong: bed.MaGiuong,
      MaPhong: bed.MaPhong,
      SoGiuong: bed.SoGiuong,
      TrangThai: bed.TrangThai || "HOAT_DONG",
    });
    setShowCreateModal(true);
  };

  const openAssignModal = (bed) => {
    setSelectedBed(bed);
    setShowAssignModal(true);
    // Fetch available students based on room type
    if (bed.Phong && bed.Phong.LoaiPhong) {
      fetchAvailableStudents(bed.Phong.LoaiPhong);
    } else {
      fetchAvailableStudents();
    }
  };

  // Table columns
  const columns = [
    {
      key: "MaGiuong",
      title: "Mã Giường",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "SoGiuong",
      title: "Số Giường",
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: "Phong",
      title: "Phòng",
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.Phong?.SoPhong}</div>
          <div className="text-sm text-gray-500">{row.Phong?.LoaiPhong}</div>
        </div>
      ),
    },
    {
      key: "DaCoNguoi",
      title: "Trạng Thái",
      render: (value, row) => (
        <div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {value ? "Đã có người" : "Trống"}
          </span>
          {row.SinhVien && (
            <div className="text-sm text-gray-600 mt-1">
              {row.SinhVien.HoTen}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao Tác",
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
              Phân bổ SV
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
        </div>
      ),
    },
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedRoom
              ? `Quản lý giường - Phòng ${
                  getSelectedRoomInfo()?.SoPhong || selectedRoom
                }`
              : "Quản lý giường"}
          </h1>
          <p className="text-gray-600">
            {selectedRoom
              ? `Quản lý thông tin giường phòng ${
                  getSelectedRoomInfo()?.SoPhong || selectedRoom
                }`
              : "Quản lý thông tin giường ở ký túc xá"}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giường</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRoom ? allBeds.length : beds.length}
                </p>
                {selectedRoom && getSelectedRoomInfo() && (
                  <p className="text-xs text-gray-500">
                    / {getSelectedRoomInfo().SucChua} giường tối đa
                  </p>
                )}
              </div>
              <Bed className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Giường trống
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedRoom
                    ? allBeds.filter((bed) => !bed.DaCoNguoi).length
                    : beds.filter((bed) => !bed.DaCoNguoi).length}
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
                  {selectedRoom
                    ? allBeds.filter((bed) => bed.DaCoNguoi).length
                    : beds.filter((bed) => bed.DaCoNguoi).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          {/* Tỷ lệ sử dụng */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tỷ lệ sử dụng
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {beds.length > 0
                    ? Math.round(
                        (beds.filter((bed) => bed.DaCoNguoi).length /
                          beds.length) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-500">Tổng thể ký túc xá</p>
              </div>
              <Building className="w-8 h-8 text-purple-500" />
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
                {rooms.map((room) => (
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

            {(!selectedRoom || !isRoomFull()) && (
              <Button
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    MaPhong: selectedRoom || "",
                  }));
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm giường mới
              </Button>
            )}

            {isRoomFull() && selectedRoom && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <span className="text-yellow-700 text-sm font-medium">
                  Phòng {getSelectedRoomInfo()?.SoPhong || selectedRoom} đã đủ
                  giường ({allBeds.length}/{getSelectedRoomInfo()?.SucChua})
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedRoom("");
                setStatusFilter("");
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

        {/* Create/Edit Modal (dùng chung) */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title={
            selectedBed
              ? `Cập nhật trạng thái giường`
              : `Thêm Giường Mới${
                  formData.MaPhong
                    ? ` - Phòng ${
                        rooms.find(
                          (r) =>
                            r.MaPhong.toString() === formData.MaPhong.toString()
                        )?.SoPhong || formData.MaPhong
                      }`
                    : ""
                }`
          }
        >
          <form
            onSubmit={selectedBed ? handleUpdate : handleCreate}
            className="space-y-4"
          >
            {/* Nếu là sửa thì chỉ cho sửa trạng thái, các trường khác chỉ hiển thị */}
            {selectedBed ? (
              <>
                <Input
                  label="Mã Giường"
                  name="MaGiuong"
                  value={formData.MaGiuong}
                  disabled
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng
                  </label>
                  <select
                    name="MaPhong"
                    value={formData.MaPhong}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  >
                    {rooms.map((room) => (
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
                  disabled
                />
                <select
                  value={formData.TrangThai}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      TrangThai: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={GIUONG_STATUS.HOAT_DONG.key}>
                    {GIUONG_STATUS.HOAT_DONG.value}
                  </option>
                  <option value={GIUONG_STATUS.BAO_TRI.key}>
                    {GIUONG_STATUS.BAO_TRI.value}
                  </option>
                  {/* Chỉ cho chọn Ngưng hoạt động khi SỬA (selectedBed != null) */}
                  {selectedBed !== null && (
                    <option value={GIUONG_STATUS.NGUNG_HOAT_DONG.key}>
                      {GIUONG_STATUS.NGUNG_HOAT_DONG.value}
                    </option>
                  )}
                </select>
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
                  <Button type="submit">Cập nhật</Button>
                </div>
              </>
            ) : (
              <>
                {formData.MaPhong &&
                  (() => {
                    const selectedRoomData = rooms.find(
                      (r) =>
                        r.MaPhong.toString() === formData.MaPhong.toString()
                    );
                    const currentBedCount = allBeds.filter(
                      (b) =>
                        b.MaPhong.toString() === formData.MaPhong.toString()
                    ).length;
                    const isFull =
                      selectedRoomData &&
                      currentBedCount >= selectedRoomData.SucChua;

                    return isFull ? (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-700">
                          <strong>Cảnh báo:</strong> Phòng{" "}
                          {selectedRoomData?.SoPhong} đã đủ giường (
                          {currentBedCount}/{selectedRoomData?.SucChua})
                        </p>
                      </div>
                    ) : null;
                  })()}

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
                    {rooms.map((room) => {
                      const roomBedCount = allBeds.filter(
                        (b) => b.MaPhong.toString() === room.MaPhong.toString()
                      ).length;
                      const isRoomFull = roomBedCount >= room.SucChua;
                      return (
                        <option
                          key={room.MaPhong}
                          value={room.MaPhong}
                          disabled={isRoomFull}
                        >
                          {room.SoPhong} - {room.LoaiPhong} ({roomBedCount}/
                          {room.SucChua} giường){isRoomFull ? " - Đầy" : ""}
                        </option>
                      );
                    })}
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
                <select
                  value={formData.TrangThai}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      TrangThai: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={GIUONG_STATUS.HOAT_DONG.key}>
                    {GIUONG_STATUS.HOAT_DONG.value}
                  </option>
                  <option value={GIUONG_STATUS.BAO_TRI.key}>
                    {GIUONG_STATUS.BAO_TRI.value}
                  </option>
                </select>
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
                  <Button
                    type="submit"
                    disabled={(() => {
                      if (!formData.MaPhong) return true;
                      const selectedRoomData = rooms.find(
                        (r) =>
                          r.MaPhong.toString() === formData.MaPhong.toString()
                      );
                      const currentBedCount = allBeds.filter(
                        (b) =>
                          b.MaPhong.toString() === formData.MaPhong.toString()
                      ).length;
                      return (
                        selectedRoomData &&
                        currentBedCount >= selectedRoomData.SucChua
                      );
                    })()}
                  >
                    Tạo Giường
                  </Button>
                </div>
              </>
            )}
          </form>
        </Modal>

        {/* Assign Student Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setAssignData({ maSinhVien: "" });
          }}
          title={`Gán Sinh Viên - Giường ${selectedBed?.SoGiuong} (Phòng ${
            selectedBed?.Phong?.LoaiPhong || "Hỗn hợp"
          })`}
        >
          <form onSubmit={handleAssignStudent} className="space-y-4">
            {selectedBed?.Phong?.LoaiPhong &&
              selectedBed.Phong.LoaiPhong !== "Hỗn hợp" && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Chỉ hiển thị sinh viên{" "}
                    {selectedBed.Phong.LoaiPhong} chưa có giường
                  </p>
                </div>
              )}

            {availableStudents.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-700">
                  Không có sinh viên phù hợp để gán vào giường này
                </p>
              </div>
            )}

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
                {availableStudents.map((student) => (
                  <option key={student.MaSinhVien} value={student.MaSinhVien}>
                    {student.MaSinhVien} - {student.HoTen} ({student.GioiTinh})
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
                  setAssignData({ maSinhVien: "" });
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={availableStudents.length === 0}>
                Gán Sinh Viên
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default BedManagementPage;
