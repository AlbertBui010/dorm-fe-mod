import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Layout from "../components/Layout";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import { Badge } from "../components/ui/Badge";
import {
  Search,
  Check,
  X,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import yeuCauChuyenPhongService from "../services/api/yeuCauChuyenPhongService";
import { YEU_CAU_CHUYEN_PHONG_STATUS } from "../constants/yeuCauChuyenPhongFe";

const YeuCauChuyenPhongManagementPage = () => {
  const [yeuCauList, setYeuCauList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'view', 'approve', 'reject'
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);
  const [approveReason, setApproveReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedBed, setSelectedBed] = useState("");
  // Thêm state cho availableRooms
  const [availableRooms, setAvailableRooms] = useState([]);
  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load yêu cầu chuyển phòng
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
      };

      // Chỉ thêm trangThai nếu có giá trị
      if (statusFilter && statusFilter.trim() !== "") {
        params.trangThai = statusFilter;
      }

      const [yeuCauResponse, statsResponse] = await Promise.all([
        yeuCauChuyenPhongService.getYeuCauChuyenPhongList(params),
        yeuCauChuyenPhongService.getYeuCauChuyenPhongStats(),
      ]);

      // Transform data to match frontend expectations
      const transformedData = (yeuCauResponse.data || [])
        .map((item) => ({
          MaYeuCau: item.MaYeuCau,
          MaSinhVien: item.SinhVien?.MaSinhVien || item.MaSinhVien,
          HoTenSinhVien: item.SinhVien?.HoTen || "Chưa có thông tin",
          PhongHienTai: item.PhongHienTai || null,
          PhongMoi: item.PhongMoi || null,
          NgayYeuCau: item.NgayYeuCau,
          TrangThai: item.TrangThai,
          LyDo: item.LyDo,
        }))
        .filter((item) => item.MaYeuCau); // Đảm bảo chỉ render items có MaYeuCau

      setYeuCauList(transformedData);
      setTotalPages(yeuCauResponse.pagination?.totalPages || 1);
      setStats(statsResponse.data || {});
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1); // Reset về trang đầu khi search
    await loadData();
  };

  const handleReset = async () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
    await loadData();
  };

  const handleView = async (id) => {
    try {
      const response = await yeuCauChuyenPhongService.getYeuCauChuyenPhongById(
        id
      );

      // Transform data to match frontend expectations
      const transformedData = {
        MaYeuCau: response.data.MaYeuCau,
        MaSinhVien:
          response.data.SinhVien?.MaSinhVien || response.data.MaSinhVien,
        HoTenSinhVien: response.data.SinhVien?.HoTen || "Chưa có thông tin",
        PhongHienTai: response.data.PhongHienTai || null,
        PhongMoi: response.data.PhongMoi || null,
        NgayYeuCau: response.data.NgayYeuCau,
        TrangThai: response.data.TrangThai,
        LyDo: response.data.LyDo,
        NguoiCapNhat: response.data.NguoiCapNhat,
        NgayCapNhat: response.data.NgayCapNhat,
      };

      setSelectedYeuCau(transformedData);
      setModalType("view");
      setShowModal(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleApprove = async () => {
    if (!selectedYeuCau) return;

    try {
      const approveData = {
        lyDoDuyet: approveReason,
      };

      // Nếu có chọn giường cụ thể
      if (selectedBed) {
        approveData.selectedRoom = selectedYeuCau.PhongMoi.MaPhong;
        approveData.selectedBed = selectedBed;
      }

      await yeuCauChuyenPhongService.approveYeuCauChuyenPhong(
        selectedYeuCau.MaYeuCau,
        approveData
      );

      toast.success("Duyệt yêu cầu chuyển phòng thành công");
      setShowModal(false);
      setSelectedYeuCau(null);
      setApproveReason("");
      setSelectedBed("");
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedYeuCau) return;

    try {
      await yeuCauChuyenPhongService.rejectYeuCauChuyenPhong(
        selectedYeuCau.MaYeuCau,
        {
          lyDoTuChoi: rejectReason,
        }
      );

      toast.success("Từ chối yêu cầu chuyển phòng thành công");
      setShowModal(false);
      setSelectedYeuCau(null);
      setRejectReason("");
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [YEU_CAU_CHUYEN_PHONG_STATUS.CHO_DUYET.key]: {
        variant: "yellow",
        text: YEU_CAU_CHUYEN_PHONG_STATUS.CHO_DUYET.value,
      },
      [YEU_CAU_CHUYEN_PHONG_STATUS.DA_DUYET.key]: {
        variant: "green",
        text: YEU_CAU_CHUYEN_PHONG_STATUS.DA_DUYET.value,
      },
      [YEU_CAU_CHUYEN_PHONG_STATUS.TU_CHOI.key]: {
        variant: "red",
        text: YEU_CAU_CHUYEN_PHONG_STATUS.TU_CHOI.value,
      },
    };

    const config = statusConfig[status] || {
      variant: "gray",
      text: status,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const columns = [
    {
      key: "MaYeuCau",
      header: "Mã yêu cầu",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "MaSinhVien",
      header: "Mã sinh viên",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "HoTenSinhVien",
      header: "Tên sinh viên",
      render: (value) => <span>{value || "Chưa có thông tin"}</span>,
    },
    {
      key: "PhongHienTai",
      header: "Phòng hiện tại",
      render: (value) => (
        <span className="text-gray-600">
          {value?.SoPhong || "Chưa có thông tin"}
        </span>
      ),
    },
    {
      key: "PhongMoi",
      header: "Phòng mới",
      render: (value) => (
        <span className="text-blue-600 font-medium">
          {value?.SoPhong || "Chưa có thông tin"}
        </span>
      ),
    },
    {
      key: "NgayYeuCau",
      header: "Ngày yêu cầu",
      render: (value) => (
        <span>{new Date(value).toLocaleDateString("vi-VN")}</span>
      ),
    },
    {
      key: "TrangThai",
      header: "Trạng thái",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(record.MaYeuCau)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {record.TrangThai === YEU_CAU_CHUYEN_PHONG_STATUS.CHO_DUYET.key && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={async () => {
                  setSelectedYeuCau(record);
                  setModalType("approve");
                  setShowModal(true);

                  // Load danh sách phòng có sẵn
                  try {
                    const response =
                      await yeuCauChuyenPhongService.getAvailableRoomsAndBeds();
                    setAvailableRooms(response.data || []);

                    // Tự động set phòng mặc định là phòng sinh viên yêu cầu
                    if (record.PhongMoi?.MaPhong) {
                      // setSelectedRoom(record.PhongMoi.MaPhong); // This line was removed
                    }
                  } catch (error) {
                    console.error("Lỗi khi tải danh sách phòng:", error);
                  }
                }}
              >
                <Check className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setSelectedYeuCau(record);
                  setModalType("reject");
                  setShowModal(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
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
              Quản lý Yêu cầu chuyển phòng
            </h1>
            <p className="text-gray-600">
              Quản lý và xử lý các yêu cầu chuyển phòng của sinh viên
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Tổng yêu cầu
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.tongYeuCau || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.choDuyet || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.daDuyet || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.tuChoi || 0}
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
                placeholder="Tìm kiếm theo mã sinh viên, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={YEU_CAU_CHUYEN_PHONG_STATUS.CHO_DUYET.key}>
                {YEU_CAU_CHUYEN_PHONG_STATUS.CHO_DUYET.value}
              </option>
              <option value={YEU_CAU_CHUYEN_PHONG_STATUS.DA_DUYET.key}>
                {YEU_CAU_CHUYEN_PHONG_STATUS.DA_DUYET.value}
              </option>
              <option value={YEU_CAU_CHUYEN_PHONG_STATUS.TU_CHOI.key}>
                {YEU_CAU_CHUYEN_PHONG_STATUS.TU_CHOI.value}
              </option>
            </select>
            <Button variant="outline" onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Làm mới
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            data={yeuCauList}
            loading={loading}
            emptyMessage="Không có yêu cầu chuyển phòng nào"
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

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedYeuCau(null);
            setApproveReason("");
            setRejectReason("");
          }}
          title={
            modalType === "view"
              ? "Chi tiết yêu cầu chuyển phòng"
              : modalType === "approve"
              ? "Duyệt yêu cầu chuyển phòng"
              : "Từ chối yêu cầu chuyển phòng"
          }
        >
          {modalType === "view" && selectedYeuCau && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mã yêu cầu
                  </label>
                  <p className="font-mono text-sm">{selectedYeuCau.MaYeuCau}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mã sinh viên
                  </label>
                  <p className="font-medium">{selectedYeuCau.MaSinhVien}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tên sinh viên
                  </label>
                  <p>{selectedYeuCau.HoTenSinhVien}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày yêu cầu
                  </label>
                  <p>
                    {new Date(selectedYeuCau.NgayYeuCau).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phòng hiện tại
                  </label>
                  <p className="text-gray-600">
                    {selectedYeuCau.PhongHienTai?.SoPhong ||
                      "Chưa có thông tin"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phòng mới
                  </label>
                  <p className="text-blue-600 font-medium">
                    {selectedYeuCau.PhongMoi?.SoPhong || "Chưa có thông tin"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Lý do chuyển phòng
                  </label>
                  <p className="text-gray-700">
                    {selectedYeuCau.LyDo || "Không có lý do"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedYeuCau.TrangThai)}
                  </div>
                </div>

                {/* Thông tin xử lý */}
                {selectedYeuCau.TrangThai ===
                  YEU_CAU_CHUYEN_PHONG_STATUS.DA_DUYET.key && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Lý do duyệt
                      </label>
                      <p className="text-green-700">
                        {selectedYeuCau.LyDo || "Không có lý do duyệt"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Người duyệt
                      </label>
                      <p className="text-gray-700">
                        {selectedYeuCau.NguoiCapNhat || "Không có thông tin"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày duyệt
                      </label>
                      <p className="text-gray-700">
                        {selectedYeuCau.NgayCapNhat
                          ? new Date(
                              selectedYeuCau.NgayCapNhat
                            ).toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
                      </p>
                    </div>
                  </>
                )}

                {selectedYeuCau.TrangThai ===
                  YEU_CAU_CHUYEN_PHONG_STATUS.TU_CHOI.key && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Lý do từ chối
                      </label>
                      <p className="text-red-700">
                        {selectedYeuCau.LyDo || "Không có lý do từ chối"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Người từ chối
                      </label>
                      <p className="text-gray-700">
                        {selectedYeuCau.NguoiCapNhat || "Không có thông tin"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày từ chối
                      </label>
                      <p className="text-gray-700">
                        {selectedYeuCau.NgayCapNhat
                          ? new Date(
                              selectedYeuCau.NgayCapNhat
                            ).toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
                      </p>
                    </div>
                  </>
                )}

                {selectedYeuCau.TrangThai ===
                  YEU_CAU_CHUYEN_PHONG_STATUS.CHO_DUYET.key && (
                  <div className="col-span-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        <span className="font-medium">
                          Yêu cầu đang chờ duyệt
                        </span>
                        <br />
                        Nhân viên có thể duyệt hoặc từ chối yêu cầu này.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {modalType === "approve" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do duyệt (tùy chọn)
                </label>
                <textarea
                  value={approveReason}
                  onChange={(e) => setApproveReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập lý do duyệt..."
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Chọn giường cho sinh viên
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Phòng:{" "}
                  <span className="font-medium text-blue-600">
                    {selectedYeuCau?.PhongMoi?.SoPhong}
                  </span>
                  {selectedYeuCau?.PhongMoi?.MoTa &&
                    ` - ${selectedYeuCau.PhongMoi.MoTa}`}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn giường cụ thể (tùy chọn)
                  </label>
                  <select
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tự động chọn giường trống</option>
                    {availableRooms
                      .find(
                        (room) =>
                          room.MaPhong === selectedYeuCau?.PhongMoi?.MaPhong
                      )
                      ?.Giuongs?.map((bed) => (
                        <option key={bed.MaGiuong} value={bed.MaGiuong}>
                          Giường {bed.SoGiuong}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Nếu không chọn, hệ thống sẽ tự động chọn giường trống đầu
                    tiên
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    // setSelectedRoom(""); // This line was removed
                    setSelectedBed("");
                    setApproveReason("");
                  }}
                >
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleApprove}>
                  Duyệt
                </Button>
              </div>
            </div>
          )}

          {modalType === "reject" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhập lý do từ chối..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                >
                  Từ chối
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default YeuCauChuyenPhongManagementPage;
