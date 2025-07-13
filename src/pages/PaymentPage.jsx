import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Filter, CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { Badge } from '../components/ui';
import paymentService from '../services/paymentService';

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [currentPage, searchTerm, selectedStatus, selectedType, selectedMonth]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedType && { type: selectedType }),
        ...(selectedMonth && { month: selectedMonth })
      };

      const response = await paymentService.getPayments(params);
      setPayments(response.data.payments || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách thanh toán');
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentService.getAdminStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setSearchTerm(newFilters.search || '');
    setSelectedStatus(newFilters.status || '');
    setSelectedType(newFilters.type || '');
    setSelectedMonth(newFilters.month || '');
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
      toast.success('Đã duyệt thanh toán thành công');
      loadPayments();
      loadStats();
      setShowApprovalModal(false);
    } catch (error) {
      toast.error('Không thể duyệt thanh toán');
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      await paymentService.rejectCashPayment(paymentId, { reason });
      toast.success('Đã từ chối thanh toán');
      loadPayments();
      loadStats();
      setShowApprovalModal(false);
    } catch (error) {
      toast.error('Không thể từ chối thanh toán');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'CHUA_THANH_TOAN': { text: 'Chưa thanh toán', variant: 'warning' },
      'DANG_CHO_THANH_TOAN': { text: 'Đang chờ', variant: 'info' },
      'DA_THANH_TOAN': { text: 'Đã thanh toán', variant: 'success' },
      'CHO_XAC_NHAN_TIEN_MAT': { text: 'Chờ xác nhận', variant: 'warning' },
      'QUA_HAN': { text: 'Quá hạn', variant: 'danger' }
    };
    const config = statusMap[status] || { text: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getTypeText = (type) => {
    const typeMap = {
      'TIEN_PHONG': 'Tiền phòng',
      'TIEN_DIEN': 'Tiền điện', 
      'TIEN_NUOC': 'Tiền nước',
      'PHI_DICH_VU': 'Phí dịch vụ'
    };
    return typeMap[type] || type;
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Tổng thanh toán',
      value: stats.totals?.totalPayments || 0,
      icon: CreditCard,
      color: 'bg-blue-500'
    },
    {
      title: 'Chờ thanh toán',
      value: stats.totalPending || 0,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Đã thanh toán',
      value: stats.totalPaid || 0,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Quá hạn',
      value: stats.totalOverdue || 0,
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  // Payment table columns
  const columns = [
    {
      key: 'MaThanhToan',
      title: 'Mã TT',
      width: 'w-20'
    },
    {
      key: 'SinhVien',
      title: 'Sinh viên',
      render: (value, payment) => (
        <div>
          <div className="font-medium">{payment.SinhVien?.HoTen || 'N/A'}</div>
          <div className="text-sm text-gray-500">{payment.MaSinhVien}</div>
        </div>
      )
    },
    {
      key: 'LoaiThanhToan',
      title: 'Loại',
      render: (value) => getTypeText(value)
    },
    {
      key: 'ThangNam',
      title: 'Tháng/Năm'
    },
    {
      key: 'SoTien',
      title: 'Số tiền',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'TrangThai',
      title: 'Trạng thái',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'NgayTao',
      title: 'Ngày tạo',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, payment) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(payment)}
          >
            Chi tiết
          </Button>
          {payment.TrangThai === 'CHO_XAC_NHAN_TIEN_MAT' && (
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
      )
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
                <option value="DANG_CHO_THANH_TOAN">Đang chờ</option>
                <option value="DA_THANH_TOAN">Đã thanh toán</option>
                <option value="CHO_XAC_NHAN_TIEN_MAT">Chờ xác nhận</option>
                <option value="QUA_HAN">Quá hạn</option>
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
                <option value="TIEN_PHONG">Tiền phòng</option>
                <option value="TIEN_DIEN">Tiền điện</option>
                <option value="TIEN_NUOC">Tiền nước</option>
                <option value="PHI_DICH_VU">Phí dịch vụ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng
              </label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
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
                  <label className="block text-sm font-medium text-gray-700">Mã thanh toán</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.MaThanhToan}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sinh viên</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPayment.SinhVien?.HoTen} ({selectedPayment.MaSinhVien})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại thanh toán</label>
                  <p className="mt-1 text-sm text-gray-900">{getTypeText(selectedPayment.LoaiThanhToan)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số tiền</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{formatCurrency(selectedPayment.SoTien)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <p className="mt-1">{getStatusBadge(selectedPayment.TrangThai)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tháng/Năm</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.ThangNam}</p>
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin thanh toán</h4>
                <div className="space-y-2 text-sm">
                  <div>Sinh viên: {selectedPayment.SinhVien?.HoTen}</div>
                  <div>Loại: {getTypeText(selectedPayment.LoaiThanhToan)}</div>
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
                  onClick={() => handleRejectPayment(selectedPayment.MaThanhToan, 'Từ chối bởi admin')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Từ chối
                </Button>
                <Button
                  onClick={() => handleApprovePayment(selectedPayment.MaThanhToan)}
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
