import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
import Layout from "../components/Layout";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { chiSoDienNuocService } from "../services/api/chiSoDienNuocService";
import { Card } from "../components/ui/Card";
import { roomService } from "../services/api/roomService";

// Đăng ký locale tiếng Việt
registerLocale("vi", vi);

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

const getCurrentMonthYear = () => {
  return formatToMMYYYY(new Date());
};

const initialForm = {
  MaPhong: "",
  ThangNam: "",
  SoDienCu: "",
  SoDienMoi: "",
  SoNuocCu: "",
  SoNuocMoi: "",
};

const ElectricWaterIndexManagementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState({});
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchData();
    fetchRooms();
    // eslint-disable-next-line
  }, [pagination.page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await chiSoDienNuocService.getChiSoDienNuoc({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setData(res?.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.pagination?.total || 0,
        totalPages: res?.data?.pagination?.totalPages || 0,
      }));
    } catch (e) {
      toast.error("Lỗi tải dữ liệu");
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
    if (!form.MaPhong) err.MaPhong = "Bắt buộc";
    if (!form.ThangNam) err.ThangNam = "Bắt buộc";

    // Validate format MM/YYYY
    if (form.ThangNam && !/^\d{2}\/\d{4}$/.test(form.ThangNam)) {
      err.ThangNam = "Định dạng phải là MM/YYYY (VD: 07/2025)";
    }

    if (form.SoDienCu === "") err.SoDienCu = "Bắt buộc";
    if (form.SoDienMoi === "") err.SoDienMoi = "Bắt buộc";
    if (form.SoNuocCu === "") err.SoNuocCu = "Bắt buộc";
    if (form.SoNuocMoi === "") err.SoNuocMoi = "Bắt buộc";
    if (
      form.SoDienCu !== "" &&
      form.SoDienMoi !== "" &&
      Number(form.SoDienMoi) < Number(form.SoDienCu)
    ) {
      err.SoDienMoi = "Số điện mới phải >= số điện cũ";
    }
    if (
      form.SoNuocCu !== "" &&
      form.SoNuocMoi !== "" &&
      Number(form.SoNuocMoi) < Number(form.SoNuocCu)
    ) {
      err.SoNuocMoi = "Số nước mới phải >= số nước cũ";
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
        toast.success("Cập nhật thành công");
      } else {
        await chiSoDienNuocService.createChiSoDienNuoc(form);
        toast.success("Tạo mới thành công");
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        const fieldErrors = {};
        msg.forEach((m) => {
          if (m.path) fieldErrors[m.path] = m.msg;
        });
        setFormError(fieldErrors);
        toast.error("Vui lòng kiểm tra lại các trường nhập!");
      } else {
        toast.error(msg || "Lỗi thao tác");
      }
    }
  };

  const columns = [
    { header: "Mã chỉ số", key: "MaChiSo" },
    {
      header: "Phòng",
      key: "MaPhong",
      render: (v) => rooms.find((r) => r.MaPhong === v)?.SoPhong || v,
    },
    {
      header: "Tháng/Năm",
      key: "ThangNam",
      render: (value) => value || "-",
    },
    { header: "Số điện cũ", key: "SoDienCu" },
    { header: "Số điện mới", key: "SoDienMoi" },
    { header: "Số nước cũ", key: "SoNuocCu" },
    { header: "Số nước mới", key: "SoNuocMoi" },
    {
      header: "Hành động",
      key: "actions",
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(row)}>
          <Edit2 className="w-4 h-4 mr-1 inline" /> Sửa
        </Button>
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
              Quản lý chỉ số điện nước
            </h1>
            <p className="text-gray-600">
              Quản lý chỉ số điện, nước cho từng phòng trong ký túc xá
            </p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm chỉ số mới
          </Button>
        </div>

        {/* Search/filter */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tháng/năm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Bảng dữ liệu */}
        <Card>
          <Table
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Không có dữ liệu chỉ số điện nước"
          />
          <div className="p-4 border-t">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
            />
          </div>
        </Card>

        {/* Modal thêm/sửa */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editing ? "Cập nhật chỉ số" : "Thêm chỉ số mới"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mã phòng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã phòng *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.MaPhong}
                onChange={(e) =>
                  setForm((f) => ({ ...f, MaPhong: e.target.value }))
                }
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((room) => (
                  <option key={room.MaPhong} value={room.MaPhong}>
                    {room.SoPhong || room.MaPhong}
                  </option>
                ))}
              </select>
              {formError.MaPhong && (
                <p className="text-sm text-red-600">{formError.MaPhong}</p>
              )}
            </div>
            {/* Tháng/Năm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tháng/Năm *
              </label>
              <DatePicker
                selected={parseFromMMYYYY(form.ThangNam)}
                onChange={(date) => {
                  const formattedDate = formatToMMYYYY(date);
                  setForm((f) => ({ ...f, ThangNam: formattedDate }));
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
              {formError.ThangNam && (
                <p className="text-sm text-red-600">{formError.ThangNam}</p>
              )}
            </div>
            {/* Số điện cũ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện cũ *
              </label>
              <Input
                type="number"
                value={form.SoDienCu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, SoDienCu: e.target.value }))
                }
                error={formError.SoDienCu}
              />
            </div>
            {/* Số điện mới */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện mới *
              </label>
              <Input
                type="number"
                value={form.SoDienMoi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, SoDienMoi: e.target.value }))
                }
                error={formError.SoDienMoi}
              />
            </div>
            {/* Số nước cũ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số nước cũ *
              </label>
              <Input
                type="number"
                value={form.SoNuocCu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, SoNuocCu: e.target.value }))
                }
                error={formError.SoNuocCu}
              />
            </div>
            {/* Số nước mới */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số nước mới *
              </label>
              <Input
                type="number"
                value={form.SoNuocMoi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, SoNuocMoi: e.target.value }))
                }
                error={formError.SoNuocMoi}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary">
                {editing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ElectricWaterIndexManagementPage;
