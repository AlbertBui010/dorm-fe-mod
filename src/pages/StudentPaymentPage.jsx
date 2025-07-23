import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "../components/ui";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Wallet,
  RefreshCw,
  Home,
  Move,
} from "lucide-react";
import { studentPaymentService } from "../services/api/studentPaymentService";
import Layout from "../components/Layout";
import { PAYMENT_STATUS } from "../constants/paymentFe";

// Navigation sẽ được tạo động dựa vào stats (nếu có)
const getStudentNavigation = (stats) => {
  return [
    { name: "Dashboard", href: "/student/dashboard", icon: Home, show: true },
    {
      name: "Thanh toán",
      href: "/student/payments",
      icon: CreditCard,
      show: true,
      badge: stats && stats.totalPending > 0 ? stats.totalPending : null,
    },
    {
      name: "Yêu cầu chuyển phòng",
      href: "/student/yeu-cau-chuyen-phong",
      icon: Move,
      show: true,
    },
    // Thêm các mục khác nếu cần
  ];
};

const StudentPaymentPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Filter
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      setLoading(true);

      // Fetch profile and payment data in parallel
      const [paymentsResult, statsResult] = await Promise.all([
        studentPaymentService.getMyPayments({
          page: currentPage,
          limit: pageSize,
          trangThai: statusFilter,
        }),
        studentPaymentService.getPaymentStats(),
      ]);

      setPayments(paymentsResult.data.payments);
      setTotalPages(paymentsResult.data.pagination?.totalPages || 1);
      setStats(statsResult.data);
    } catch (err) {
      setError(err.message);
      if (
        err.message.includes("token") ||
        err.message.includes("Unauthorized")
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter]);

  const handlePaymentAction = async (payment, method) => {
    setActionLoading(true);
    try {
      if (method === "online") {
        const result = await studentPaymentService.createPaymentLink(
          payment.MaThanhToan
        );
        if (result.success && result.data.checkoutUrl) {
          // Open payment link in new tab
          window.open(result.data.checkoutUrl, "_blank");
          // Refresh data after a moment
          setTimeout(() => {
            fetchData();
          }, 2000);
        }
      } else if (method === "cash") {
        await studentPaymentService.processCashPayment(payment.MaThanhToan);
        // Refresh data
        fetchData();
      }
      setShowPaymentModal(false);
      setSelectedPayment(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      CHUA_THANH_TOAN: { text: "Chưa thanh toán", variant: "yellow" },
      DANG_CHO_THANH_TOAN: { text: "Đang chờ thanh toán", variant: "blue" },
      CHO_XAC_NHAN: { text: "Chờ xác nhận", variant: "purple" },
      DA_THANH_TOAN: { text: "Đã thanh toán", variant: "green" },
      QUA_HAN: { text: "Quá hạn", variant: "red" },
    };
    const config = statusConfig[status] || { text: status, variant: "gray" };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Đang tải thông tin thanh toán...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout navigation={getStudentNavigation(stats)}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Button
                  onClick={() => navigate("/student-dashboard")}
                  variant="outline"
                  size="sm"
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Thanh toán tiền phòng
                  </h1>
                  <p className="text-sm text-gray-500">
                    Quản lý và thanh toán các khoản phí ký túc xá
                  </p>
                </div>
              </div>
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalPending}
                      </p>
                      <p className="text-sm text-gray-500">Chưa thanh toán</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalPaid}
                      </p>
                      <p className="text-sm text-gray-500">Đã thanh toán</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(stats.pendingAmount)}
                      </p>
                      <p className="text-sm text-gray-500">Còn lại</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Wallet className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(stats.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">Tổng cộng</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Trạng thái
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tất cả</option>
                      <option value={PAYMENT_STATUS.CHUA_THANH_TOAN}>
                        Chưa thanh toán
                      </option>
                      <option value={PAYMENT_STATUS.DANG_CHO_THANH_TOAN}>
                        Đang chờ thanh toán
                      </option>
                      <option value={PAYMENT_STATUS.CHO_XAC_NHAN}>
                        Chờ xác nhận
                      </option>
                      <option value={PAYMENT_STATUS.DA_THANH_TOAN}>
                        Đã thanh toán
                      </option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có thanh toán nào
                  </h3>
                  <p className="text-gray-500">
                    {statusFilter
                      ? "Không có thanh toán nào với trạng thái này."
                      : "Bạn chưa có khoản thanh toán nào."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.MaThanhToan}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {payment.LoaiThanhToan}
                            </h3>
                            {getStatusBadge(payment.TrangThai)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Phòng:</span>{" "}
                              {payment.Phong?.SoPhong || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Tháng:</span>{" "}
                              {payment.ThangNam}
                            </div>
                            <div>
                              <span className="font-medium">Số tiền:</span>
                              <span className="font-bold text-blue-600 ml-1">
                                {formatCurrency(payment.SoTien)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Hạn thanh toán:
                              </span>{" "}
                              {formatDate(payment.NgayTao)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailModal(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Chi tiết
                          </Button>

                          {payment.TrangThai === "CHUA_THANH_TOAN" && (
                            <Button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentModal(true);
                              }}
                              variant="primary"
                              size="sm"
                            >
                              Thanh toán
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      variant="outline"
                      size="sm"
                    >
                      Trước
                    </Button>

                    <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                      Trang {currentPage} / {totalPages}
                    </span>

                    <Button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        >
          <ModalHeader>
            <h3 className="text-lg font-medium">Chi tiết thanh toán</h3>
          </ModalHeader>
          <ModalContent>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Mã thanh toán
                    </label>
                    <p className="text-gray-900">
                      {selectedPayment.MaThanhToan}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Loại thanh toán
                    </label>
                    <p className="text-gray-900">
                      {selectedPayment.LoaiThanhToan}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phòng
                    </label>
                    <p className="text-gray-900">
                      {selectedPayment.Phong?.SoPhong || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tháng/năm
                    </label>
                    <p className="text-gray-900">{selectedPayment.ThangNam}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Số tiền
                    </label>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(selectedPayment.SoTien)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trạng thái
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedPayment.TrangThai)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Hình thức
                    </label>
                    <p className="text-gray-900">
                      {selectedPayment.HinhThuc || "Chưa xác định"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ngày thanh toán
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedPayment.NgayThanhToan)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ModalContent>
          <ModalFooter>
            <Button onClick={() => setShowDetailModal(false)} variant="outline">
              Đóng
            </Button>
          </ModalFooter>
        </Modal>

        {/* Payment Method Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        >
          <ModalHeader>
            <h3 className="text-lg font-medium">Chọn phương thức thanh toán</h3>
          </ModalHeader>
          <ModalContent>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">
                    {selectedPayment.LoaiThanhToan} - {selectedPayment.ThangNam}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {formatCurrency(selectedPayment.SoTien)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="mr-3"
                      />
                      <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Chuyển khoản online
                        </h4>
                        <p className="text-sm text-gray-500">
                          Thanh toán qua QR code hoặc chuyển khoản ngân hàng
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === "cash"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="mr-3"
                      />
                      <Wallet className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Tiền mặt</h4>
                        <p className="text-sm text-gray-500">
                          Thanh toán trực tiếp tại văn phòng ký túc xá
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalContent>
          <ModalFooter>
            <Button
              onClick={() => setShowPaymentModal(false)}
              variant="outline"
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={() =>
                handlePaymentAction(selectedPayment, paymentMethod)
              }
              variant="primary"
              disabled={!paymentMethod || actionLoading}
            >
              {actionLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                <>
                  {paymentMethod === "online" ? (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Thanh toán online
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Đăng ký thanh toán tiền mặt
                    </>
                  )}
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </Layout>
  );
};

export default StudentPaymentPage;
