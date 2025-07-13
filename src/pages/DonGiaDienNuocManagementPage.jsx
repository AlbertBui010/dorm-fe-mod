import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, TrendingUp, Activity, Droplets } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import { donGiaDienNuocService } from '../services/api';

const DonGiaDienNuocManagementPage = () => {
  const [donGias, setDonGias] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonGia, setEditingDonGia] = useState(null);
  const [currentDonGia, setCurrentDonGia] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    current: 0,
    expired: 0,
    avgElectricity: 0,
    avgWater: 0
  });
  const [formData, setFormData] = useState({
    NgayApDung: '',
    GiaDienPerKWh: '',
    GiaNuocPerM3: '',
  });

  const columns = [
    {
      header: 'Mã đơn giá',
      key: 'MaDonGia',
      width: '100px',
    },
    {
      header: 'Ngày áp dụng',
      key: 'NgayApDung',
      render: (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      header: 'Giá điện (VNĐ/kWh)',
      key: 'GiaDienPerKWh',
      render: (value) => new Intl.NumberFormat('vi-VN').format(value),
    },
    {
      header: 'Giá nước (VNĐ/m³)',
      key: 'GiaNuocPerM3',
      render: (value) => new Intl.NumberFormat('vi-VN').format(value),
    },
    {
      header: 'Ngày kết thúc',
      key: 'NgayKetThuc',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Đang áp dụng',
    },
    {
      header: 'Người tạo',
      key: 'NguoiTao',
    },
    {
      header: 'Hành động',
      key: 'actions',
      width: '200px',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            Sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row.MaDonGia)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchDonGias();
    fetchCurrentDonGia();
  }, [pagination.currentPage, searchTerm]);

  // Load stats whenever donGias changes
  useEffect(() => {
    loadStats();
  }, [donGias]);

  const loadStats = () => {
    if (donGias && donGias.length > 0) {
      const total = donGias.length;
      
      // Count current vs expired based on NgayKetThuc
      const current = donGias.filter(d => !d.NgayKetThuc || d.NgayKetThuc === null).length;
      const expired = donGias.filter(d => d.NgayKetThuc && d.NgayKetThuc !== null).length;
      
      // Calculate averages with proper number conversion
      let totalElectricityPrice = 0;
      let totalWaterPrice = 0;
      
      donGias.forEach(d => {
        const electricityPrice = parseFloat(d.GiaDienPerKWh) || 0;
        const waterPrice = parseFloat(d.GiaNuocPerM3) || 0;
        totalElectricityPrice += electricityPrice;
        totalWaterPrice += waterPrice;
      });
      
      const avgElectricity = total > 0 ? Math.round(totalElectricityPrice / total) : 0;
      const avgWater = total > 0 ? Math.round(totalWaterPrice / total) : 0;
      
      setStats({
        total,
        current,
        expired,
        avgElectricity,
        avgWater
      });
    } else {
      setStats({
        total: 0,
        current: 0,
        expired: 0,
        avgElectricity: 0,
        avgWater: 0
      });
    }
  };

  const fetchDonGias = async () => {
    try {
      setLoading(true);
      const response = await donGiaDienNuocService.getAllDonGia(
        pagination.currentPage,
        pagination.itemsPerPage,
        searchTerm
      );
      
      if (response.success) {
        setDonGias(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentDonGia = async () => {
    try {
      const response = await donGiaDienNuocService.getCurrentDonGia();
      if (response.success) {
        setCurrentDonGia(response.data);
      }
    } catch (error) {
      // Không hiển thị toast error cho trường hợp không có đơn giá hiện hành
      setCurrentDonGia(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const resetForm = () => {
    setFormData({
      NgayApDung: '',
      GiaDienPerKWh: '',
      GiaNuocPerM3: '',
    });
    setEditingDonGia(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = async (donGia) => {
    try {
      // Kiểm tra có thể chỉnh sửa không
      const canEditResponse = await donGiaDienNuocService.checkCanEdit(donGia.MaDonGia);
      
      if (!canEditResponse.data.canEdit) {
        toast.error('Không thể chỉnh sửa đơn giá đã áp dụng hoặc đã kết thúc');
        return;
      }

      setEditingDonGia(donGia);
      setFormData({
        NgayApDung: donGia.NgayApDung,
        GiaDienPerKWh: donGia.GiaDienPerKWh,
        GiaNuocPerM3: donGia.GiaNuocPerM3,
      });
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Lỗi khi kiểm tra quyền chỉnh sửa');
    }
  };

  const handleDelete = async (maDonGia) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn giá này?')) {
      return;
    }

    try {
      // Kiểm tra có thể xóa không
      const canDeleteResponse = await donGiaDienNuocService.checkCanDelete(maDonGia);
      
      if (!canDeleteResponse.data.canDelete) {
        toast.error('Không thể xóa đơn giá đã được sử dụng trong chi tiết điện nước');
        return;
      }

      const response = await donGiaDienNuocService.deleteDonGia(maDonGia);
      
      if (response.success) {
        toast.success('Xóa đơn giá thành công');
        fetchDonGias();
        fetchCurrentDonGia();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa đơn giá');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.NgayApDung || !formData.GiaDienPerKWh || !formData.GiaNuocPerM3) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (parseFloat(formData.GiaDienPerKWh) < 0 || parseFloat(formData.GiaNuocPerM3) < 0) {
      toast.error('Giá điện và giá nước phải lớn hơn hoặc bằng 0');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        NgayApDung: formData.NgayApDung,
        GiaDienPerKWh: parseFloat(formData.GiaDienPerKWh),
        GiaNuocPerM3: parseFloat(formData.GiaNuocPerM3),
      };

      let response;
      if (editingDonGia) {
        response = await donGiaDienNuocService.updateDonGia(editingDonGia.MaDonGia, submitData);
      } else {
        response = await donGiaDienNuocService.createDonGia(submitData);
      }

      if (response.success) {
        toast.success(editingDonGia ? 'Cập nhật đơn giá thành công' : 'Tạo đơn giá mới thành công');
        setIsModalOpen(false);
        resetForm();
        fetchDonGias();
        fetchCurrentDonGia();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu đơn giá');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn giá Điện/Nước</h1>
            <p className="text-gray-600">Quản lý giá điện và nước áp dụng trong ký túc xá</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm đơn giá mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tổng đơn giá</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đang áp dụng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.current || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã kết thúc</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">TB Giá điện</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgElectricity ? new Intl.NumberFormat('vi-VN').format(stats.avgElectricity) : 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Droplets className="w-8 h-8 text-cyan-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">TB Giá nước</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgWater ? new Intl.NumberFormat('vi-VN').format(stats.avgWater) : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Đơn giá hiện hành */}
        {currentDonGia && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Đơn giá hiện hành</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Ngày áp dụng:</span>
                <p className="font-medium">{new Date(currentDonGia.NgayApDung).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Giá điện:</span>
                <p className="font-medium">{new Intl.NumberFormat('vi-VN').format(currentDonGia.GiaDienPerKWh)} VNĐ/kWh</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Giá nước:</span>
                <p className="font-medium">{new Intl.NumberFormat('vi-VN').format(currentDonGia.GiaNuocPerM3)} VNĐ/m³</p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm đơn giá..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Bảng danh sách */}
        <Card>
          <Table
            columns={columns}
            data={donGias}
            loading={loading}
            emptyMessage="Không có đơn giá nào"
          />
          
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Card>

        {/* Modal thêm/sửa */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingDonGia ? 'Chỉnh sửa đơn giá' : 'Thêm đơn giá mới'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày áp dụng *
              </label>
              <Input
                type="date"
                name="NgayApDung"
                value={formData.NgayApDung}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá điện (VNĐ/kWh) *
              </label>
              <Input
                type="number"
                name="GiaDienPerKWh"
                value={formData.GiaDienPerKWh}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Ví dụ: 3500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá nước (VNĐ/m³) *
              </label>
              <Input
                type="number"
                name="GiaNuocPerM3"
                value={formData.GiaNuocPerM3}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Ví dụ: 25000"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                {editingDonGia ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default DonGiaDienNuocManagementPage;
