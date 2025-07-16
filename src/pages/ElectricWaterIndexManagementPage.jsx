import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Search } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { chiSoDienNuocService } from '../services/api/chiSoDienNuocService';
import { Card } from '../components/ui/Card';
import { roomService } from '../services/api/roomService';

const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const initialForm = {
  MaPhong: '',
  ThangNam: '',
  SoDienCu: '',
  SoDienMoi: '',
  SoNuocCu: '',
  SoNuocMoi: '',
};

const ElectricWaterIndexManagementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState({});
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchData();
    fetchRooms();
  }, [pagination.page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await chiSoDienNuocService.getChiSoDienNuoc({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setData(res.data || []);
      setPagination(prev => ({ ...prev, total: res.data?.length || 0 }));
    } catch (e) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    const res = await roomService.getAll();
    setRooms(res.data || []);
  };

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      ...initialForm,
      ThangNam: getCurrentMonthYear(),
    });
    setFormError({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditing(row);
    setForm({
      MaPhong: row.MaPhong,
      ThangNam: row.ThangNam,
      SoDienCu: row.SoDienCu,
      SoDienMoi: row.SoDienMoi,
      SoNuocCu: row.SoNuocCu,
      SoNuocMoi: row.SoNuocMoi,
    });
    setFormError({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(initialForm);
    setFormError({});
  };

  const validateForm = () => {
    const err = {};
    if (!form.MaPhong) err.MaPhong = 'Bắt buộc';
    if (!form.ThangNam) err.ThangNam = 'Bắt buộc';
    if (form.SoDienCu === '') err.SoDienCu = 'Bắt buộc';
    if (form.SoDienMoi === '') err.SoDienMoi = 'Bắt buộc';
    if (form.SoNuocCu === '') err.SoNuocCu = 'Bắt buộc';
    if (form.SoNuocMoi === '') err.SoNuocMoi = 'Bắt buộc';
    if (form.SoDienCu !== '' && form.SoDienMoi !== '' && Number(form.SoDienMoi) < Number(form.SoDienCu)) {
      err.SoDienMoi = 'Số điện mới phải >= số điện cũ';
    }
    if (form.SoNuocCu !== '' && form.SoNuocMoi !== '' && Number(form.SoNuocMoi) < Number(form.SoNuocCu)) {
      err.SoNuocMoi = 'Số nước mới phải >= số nước cũ';
    }
    setFormError(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editing) {
        await chiSoDienNuocService.updateChiSoDienNuoc(editing.MaChiSo, form);
        toast.success('Cập nhật thành công');
      } else {
        await chiSoDienNuocService.createChiSoDienNuoc(form);
        toast.success('Tạo mới thành công');
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        const fieldErrors = {};
        msg.forEach(m => {
          if (m.path) fieldErrors[m.path] = m.msg;
        });
        setFormError(fieldErrors);
        toast.error('Vui lòng kiểm tra lại các trường nhập!');
      } else {
        toast.error(msg || 'Lỗi thao tác');
      }
    }
  };

  const columns = [
    { header: 'Mã chỉ số', key: 'MaChiSo' },
    { header: 'Phòng', key: 'MaPhong', render: (v) => rooms.find(r => r.MaPhong === v)?.SoPhong || v },
    { header: 'Tháng/Năm', key: 'ThangNam' },
    { header: 'Số điện cũ', key: 'SoDienCu' },
    { header: 'Số điện mới', key: 'SoDienMoi' },
    { header: 'Số nước cũ', key: 'SoNuocCu' },
    { header: 'Số nước mới', key: 'SoNuocMoi' },
    {
      header: 'Hành động',
      key: 'actions',
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(row)}>
          <Edit2 className="w-4 h-4 mr-1 inline" /> Sửa
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quản lý chỉ số điện nước</h2>
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2 inline" /> Thêm mới
          </Button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo phòng, tháng..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-64"
            prefix={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <Card>
          <Table
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Không có dữ liệu chỉ số điện nước"
          />
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.limit) || 1}
              onPageChange={page => setPagination(p => ({ ...p, page }))}
            />
          </div>
        </Card>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editing ? 'Cập nhật chỉ số' : 'Thêm chỉ số mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã phòng */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã phòng</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.MaPhong}
              onChange={e => setForm(f => ({ ...f, MaPhong: e.target.value }))}
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map(room => (
                <option key={room.MaPhong} value={room.MaPhong}>
                  {room.SoPhong || room.MaPhong}
                </option>
              ))}
            </select>
            {formError.MaPhong && <p className="text-sm text-red-600">{formError.MaPhong}</p>}
          </div>
          {/* Tháng/Năm */}
          <Input
            label="Tháng/Năm"
            type="month"
            value={form.ThangNam}
            onChange={e => setForm(f => ({ ...f, ThangNam: e.target.value }))}
            error={formError.ThangNam}
          />
          {/* Số điện cũ */}
          <Input
            label="Số điện cũ"
            type="number"
            value={form.SoDienCu}
            onChange={e => setForm(f => ({ ...f, SoDienCu: e.target.value }))}
            error={formError.SoDienCu}
          />
          {/* Số điện mới */}
          <Input
            label="Số điện mới"
            type="number"
            value={form.SoDienMoi}
            onChange={e => setForm(f => ({ ...f, SoDienMoi: e.target.value }))}
            error={formError.SoDienMoi}
          />
          {/* Số nước cũ */}
          <Input
            label="Số nước cũ"
            type="number"
            value={form.SoNuocCu}
            onChange={e => setForm(f => ({ ...f, SoNuocCu: e.target.value }))}
            error={formError.SoNuocCu}
          />
          {/* Số nước mới */}
          <Input
            label="Số nước mới"
            type="number"
            value={form.SoNuocMoi}
            onChange={e => setForm(f => ({ ...f, SoNuocMoi: e.target.value }))}
            error={formError.SoNuocMoi}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Hủy</Button>
            <Button type="submit" variant="primary">{editing ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ElectricWaterIndexManagementPage; 