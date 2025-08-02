import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
import {
  Search,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Đăng ký locale tiếng Việt
registerLocale("vi", vi);

// CSS tùy chỉnh cho DatePicker
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .react-datepicker__input-container input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  .react-datepicker__month-year-text {
    font-weight: 600;
    color: #374151;
  }
  .react-datepicker__header__dropdown {
    background-color: #f9fafb;
  }
`;

import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import { Badge } from "../components/ui";
import paymentService from "../services/paymentService";
import roomService from "../services/api/roomService";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PAYMENT_METHOD,
} from "../constants/paymentFe";
import { convertMethodPayment } from "../utils/convertMethodPayment";
import { formatCurrency } from "../utils/formatCurrency";

// Helper functions cho date formatting (MM/YYYY)
const formatToMMYYYY = (date) => {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const parseFromMMYYYY = (mmYYYY) => {
  if (!mmYYYY || !/^\d{2}\/\d{4}$/.test(mmYYYY)) return null;
  const [month, year] = mmYYYY.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, 1);
};

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [
    currentPage,
    searchTerm,
    selectedStatus,
    selectedType,
    selectedMethod,
    selectedMonth,
    selectedRoom,
  ]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedType && { type: selectedType }),
        ...(selectedMethod && { method: selectedMethod }),
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedRoom && { room: selectedRoom }),
      };

      const response = await paymentService.getPayments(params);
      const paymentList = response.data.payments || [];
      setPayments(paymentList);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Không thể tải danh sách thanh toán");
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentService.getAdminStats();
      setStats(response.data || {});
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await roomService.getAll();
      setRooms(response.data || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setSearchTerm(newFilters.search || "");
    setSelectedStatus(newFilters.status || "");
    setSelectedType(newFilters.type || "");
    setSelectedMethod(newFilters.method || "");
    setSelectedMonth(newFilters.month || "");
    setSelectedRoom(newFilters.room || "");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await paymentService.approveCashPayment(paymentId);
      toast.success("Đã duyệt thanh toán thành công");
      loadPayments();
      loadStats();
      setShowApprovalModal(false);
    } catch (error) {
      toast.error("Không thể duyệt thanh toán");
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      await paymentService.rejectCashPayment(paymentId, { reason });
      toast.success("Đã từ chối thanh toán");
      loadPayments();
      loadStats();
      setShowApprovalModal(false);
    } catch (error) {
      toast.error("Không thể từ chối thanh toán");
    }
  };

  const getStatusBadge = (status, hinhThuc) => {
    const statusMap = {
      CHUA_THANH_TOAN: { text: "Chưa thanh toán", variant: "yellow" },
      DANG_CHO_THANH_TOAN: { text: "Đang chờ", variant: "blue" },
      DA_THANH_TOAN: { text: "Đã thanh toán", variant: "green" },
      CHO_XAC_NHAN: {
        text:
          hinhThuc === PAYMENT_METHOD.TIEN_MAT.key
            ? "Chờ xác nhận (Tiền mặt)"
            : "Chờ xác nhận",
        variant: "yellow",
      },
      QUA_HAN: { text: "Quá hạn", variant: "red" },
    };
    const config = statusMap[status] || { text: status, variant: "gray" };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  // Stats cards data
  const statsCards = [
    {
      title: "Tổng thanh toán",
      value: stats.totals?.totalPayments || 0,
      icon: CreditCard,
      color: "bg-blue-500",
    },
    {
      title: "Chờ thanh toán",
      value: stats.totalPending || 0,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Đã thanh toán",
      value: stats.totalPaid || 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Quá hạn",
      value: stats.totalOverdue || 0,
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  // Payment table columns
  const columns = [
    {
      key: "MaThanhToan",
      title: "Mã TT",
      width: "w-20",
    },
    {
      key: "SinhVien",
      title: "Sinh viên",
      render: (value, payment) => (
        <div>
          <div className="font-medium">{payment.SinhVien?.HoTen || "N/A"}</div>
          <div className="text-sm text-gray-500">{payment.MaSinhVien}</div>
        </div>
      ),
    },
    {
      key: "LoaiThanhToan",
      title: "Loại",
      render: (value) => PAYMENT_TYPE[value]?.value || value,
      width: "w-20",
      align: "center",
    },
    {
      key: "Phong",
      title: "Phòng",
      render: (value, payment) => {
        if (!payment.Phong) return "-";
        return (
          <div className="text-center">
            <div className="font-medium">{payment.Phong.SoPhong}</div>
            <div className="text-xs text-gray-500">
              {payment.Phong.LoaiPhong}
            </div>
          </div>
        );
      },
      width: "w-20",
      align: "center",
    },
    {
      key: "HinhThuc",
      title: "Hình thức",
      render: (value) => {
        if (!value || value.trim() === "") {
          return <Badge variant="gray">Chưa xác định</Badge>;
        }

        const methodConfig = {
          [PAYMENT_METHOD.TIEN_MAT.key]: {
            variant: "blue",
            text: PAYMENT_METHOD.TIEN_MAT.value,
          },
          [PAYMENT_METHOD.CHUYEN_KHOAN.key]: {
            variant: "green",
            text: PAYMENT_METHOD.CHUYEN_KHOAN.value,
          },
        };

        const config = methodConfig[value];
        if (config) {
          return <Badge variant={config.variant}>{config.text}</Badge>;
        }

        return value;
      },
      width: "w-24",
      align: "center",
    },
    {
      key: "ThangNam",
      title: "Tháng/Năm",
      render: (value) => {
        if (!value) return "-";
        // Nếu format là YYYY-MM thì convert sang MM/YYYY
        if (value.includes("-")) {
          const [year, month] = value.split("-");
          return `${month}/${year}`;
        }
        return value; // Giữ nguyên nếu đã là MM/YYYY
      },
      width: "w-20",
      align: "center",
    },
    {
      key: "SoTien",
      title: "Số tiền",
      render: (value) => formatCurrency(value),
      width: "w-20",
      align: "center",
    },
    {
      key: "TrangThai",
      title: "Trạng thái",
      render: (value, payment) => getStatusBadge(value, payment.HinhThuc),
      width: "w-20",
      align: "center",
    },
    {
      key: "NgayTao",
      title: "Ngày tạo",
      render: (value) => new Date(value).toLocaleDateString("vi-VN"),
      width: "w-20",
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, payment) => {
        const shouldShowApproveButton =
          payment.TrangThai?.trim() === PAYMENT_STATUS.CHO_XAC_NHAN.key &&
          payment.HinhThuc?.trim() === PAYMENT_METHOD.TIEN_MAT.key;

        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(payment)}
            >
              Chi tiết
            </Button>
            {shouldShowApproveButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPayment(payment);
                  setShowApprovalModal(true);
                }}
              >
                Duyệt
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <style>{datePickerStyles}</style>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý thanh toán
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi và xử lý các khoản thanh toán của sinh viên
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm theo mã SV, tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value={PAYMENT_STATUS.CHUA_THANH_TOAN.key}>
                  Chưa thanh toán
                </option>
                <option value={PAYMENT_STATUS.DANG_CHO_THANH_TOAN.key}>
                  Đang chờ
                </option>
                <option value={PAYMENT_STATUS.DA_THANH_TOAN.key}>
                  Đã thanh toán
                </option>
                <option value={PAYMENT_STATUS.CHO_XAC_NHAN.key}>
                  Chờ xác nhận
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại thanh toán
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value={PAYMENT_TYPE.TIEN_PHONG.key}>
                  {PAYMENT_TYPE.TIEN_PHONG.value}
                </option>
                <option value={PAYMENT_TYPE.TIEN_DIEN_NUOC.key}>
                  {PAYMENT_TYPE.TIEN_DIEN_NUOC.value}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình thức
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value={PAYMENT_METHOD.TIEN_MAT.key}>
                  {PAYMENT_METHOD.TIEN_MAT.value}
                </option>
                <option value={PAYMENT_METHOD.CHUYEN_KHOAN.key}>
                  {PAYMENT_METHOD.CHUYEN_KHOAN.value}
                </option>
                <option value="null">Chưa xác định</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng/Năm
              </label>
              <DatePicker
                selected={parseFromMMYYYY(selectedMonth)}
                onChange={(date) => {
                  const formattedDate = formatToMMYYYY(date);
                  setSelectedMonth(formattedDate);
                }}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                showFullMonthYearPicker
                locale="vi"
                placeholderText="Chọn tháng/năm"
                isClearable
                clearButtonTitle="Xóa"
                todayButton="Hôm nay"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả phòng</option>
                {rooms.map((room) => (
                  <option key={room.MaPhong} value={room.MaPhong}>
                    Phòng {room.SoPhong}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end justify-end h-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange({})}
                className="h-10"
              >
                Xoá bộ lọc
              </Button>
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Danh sách thanh toán
              </h2>
              <div className="text-sm text-gray-500">
                Tổng: {payments.length} thanh toán
              </div>
            </div>

            <Table
              columns={columns}
              data={payments}
              loading={loading}
              emptyMessage="Không có thanh toán nào"
            />

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Modals */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Chi tiết thanh toán"
          size="lg"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Mã thanh toán
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.MaThanhToan}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Mã sinh viên
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.MaSinhVien}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Họ tên sinh viên
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.SinhVien?.HoTen}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Email sinh viên
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.SinhVien?.Email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Mã phòng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.MaPhong}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Số phòng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.Phong?.SoPhong}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Loại phòng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.Phong?.LoaiPhong}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Loại thanh toán
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {PAYMENT_TYPE[selectedPayment.LoaiThanhToan]?.value ||
                      selectedPayment.LoaiThanhToan}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Hình thức
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {!selectedPayment.HinhThuc ||
                    selectedPayment.HinhThuc.trim() === ""
                      ? "Chưa xác định"
                      : convertMethodPayment(selectedPayment.HinhThuc)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Số tiền
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    {formatCurrency(selectedPayment.SoTien)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Trạng thái
                  </label>
                  <p className="mt-1">
                    {getStatusBadge(
                      selectedPayment.TrangThai,
                      selectedPayment.HinhThuc
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Tháng/Năm
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.ThangNam}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Ngày thanh toán
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.NgayThanhToan
                      ? new Date(
                          selectedPayment.NgayThanhToan
                        ).toLocaleDateString("vi-VN")
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    OrderCode
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.OrderCode || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Reference
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.Reference || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mô tả
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.MoTa || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Ngày tạo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.NgayTao
                      ? new Date(selectedPayment.NgayTao).toLocaleString(
                          "vi-VN"
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Người tạo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.NguoiTao || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Ngày cập nhật
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.NgayCapNhat
                      ? new Date(selectedPayment.NgayCapNhat).toLocaleString(
                          "vi-VN"
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Người cập nhật
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.NguoiCapNhat || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title="Duyệt thanh toán tiền mặt"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="font-medium text-blue-900">
                    Thanh toán tiền mặt cần xác nhận
                  </h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Sinh viên đã thanh toán tiền mặt và đang chờ xác nhận từ
                  admin.
                </p>
                <div className="space-y-2 text-sm">
                  <div>Sinh viên: {selectedPayment.SinhVien?.HoTen}</div>
                  <div>
                    Loại:{" "}
                    {PAYMENT_TYPE[selectedPayment.LoaiThanhToan]?.value ||
                      selectedPayment.LoaiThanhToan}
                  </div>
                  <div>Số tiền: {formatCurrency(selectedPayment.SoTien)}</div>
                  <div>Tháng: {selectedPayment.ThangNam}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleRejectPayment(
                      selectedPayment.MaThanhToan,
                      "Từ chối bởi admin"
                    )
                  }
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Từ chối
                </Button>
                <Button
                  onClick={() =>
                    handleApprovePayment(selectedPayment.MaThanhToan)
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  Duyệt thanh toán
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default PaymentPage;
