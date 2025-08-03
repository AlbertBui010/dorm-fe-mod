import { useEffect, useState } from "react";
import chiTietDienNuocService from "../services/api/chiTietDienNuocService";
import { roomService } from "../services/api/roomService";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { authService } from "../services/api/authService";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import { Search, Download } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
import { exportToExcel, EXPORT_CONFIGS } from "../utils/exportExcel";

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

const columns = [
  { key: "ID", title: "ID" },
  { key: "MaSinhVien", title: "Mã SV" },
  { key: "MaChiSo", title: "Mã Chỉ Số" },
  {
    key: "SoPhong",
    title: "Phòng",
    render: (v, row) => {
      // Hiển thị thông tin phòng từ các nguồn khác nhau
      if (row.ChiSoDienNuoc?.Phong?.SoPhong) {
        return row.ChiSoDienNuoc.Phong.SoPhong;
      }
      if (row.SinhVien?.Giuong?.Phong?.SoPhong) {
        return row.SinhVien.Giuong.Phong.SoPhong;
      }
      return row.SoPhong || "-";
    },
  },
  { key: "SoNgayO", title: "Số Ngày Ở" },
  { 
    key: "TienDien", 
    title: "Tiền Điện",
    render: (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value || 0);
    }
  },
  { 
    key: "TienNuoc", 
    title: "Tiền Nước",
    render: (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value || 0);
    }
  },
  {
    key: "ChiSoDienNuoc.ThangNam",
    title: "Tháng Năm",
    render: (v, row) => row.ChiSoDienNuoc?.ThangNam || "",
  },
  {
    key: "NgayTao",
    title: "Ngày Tạo",
    render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : ""),
  },
];

const PAGE_SIZE = 10;

const ChiTietDienNuocPage = () => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.VaiTro === "QuanTriVien" || user?.VaiTro === "NhanVien";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [thangNam, setThangNam] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  // Fetch rooms for filter
  const fetchRooms = async () => {
    try {
      const res = await roomService.getAll();
      setRooms(res.data || []);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      };
      if (search) params.MaSinhVien = search;
      if (thangNam) params.ThangNam = thangNam;
      if (selectedRoom) params.MaPhong = selectedRoom;
      
      let res;
      if (isAdmin) {
        res = await chiTietDienNuocService.getAll(params);
      } else {
        res = await chiTietDienNuocService.getMine({ ...params });
      }
      setData(res.data || []);
      setTotal(res.pagination?.totalItems || res.data?.length || 0);
    } catch (err) {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchRooms();
  }, [page, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [search, thangNam, selectedRoom]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleThangNamChange = (date) => {
    const formattedDate = formatToMMYYYY(date);
    setThangNam(formattedDate);
    setPage(1);
  };

  const handleRoomFilter = (e) => {
    setSelectedRoom(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setThangNam("");
    setSelectedRoom("");
    setPage(1);
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      // Fetch all data for export (no pagination)
      const params = {};
      if (search) params.MaSinhVien = search;
      if (thangNam) params.ThangNam = thangNam;
      if (selectedRoom) params.MaPhong = selectedRoom;

      let res;
      if (isAdmin) {
        res = await chiTietDienNuocService.getAll({ ...params, limit: 999999 });
      } else {
        res = await chiTietDienNuocService.getMine({ ...params, limit: 999999 });
      }

      const exportData = res.data || [];

      exportToExcel({
        data: exportData,
        ...EXPORT_CONFIGS.electricWaterDetail,
        onSuccess: ({ count }) => {
          console.log(`Đã export ${count} hóa đơn điện nước`);
        },
      });
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hóa Đơn Điện Nước
            </h1>
            <p className="text-gray-600">
              Quản lý và tạo hóa đơn tiền điện nước cho sinh viên theo từng tháng
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportExcel}
              disabled={loading || data.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isAdmin && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo mã sinh viên..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            )}
            
            <div>
              <DatePicker
                selected={parseFromMMYYYY(thangNam)}
                onChange={handleThangNamChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                showFullMonthYearPicker
                locale="vi"
                placeholderText="Chọn tháng/năm"
                isClearable
                clearButtonTitle="Xóa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedRoom}
              onChange={handleRoomFilter}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả phòng</option>
              {rooms.map((room) => (
                <option key={room.MaPhong} value={room.MaPhong}>
                  {room.SoPhong}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Card>

        {/* Bảng danh sách */}
        <Card>
          <Table
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Không có hóa đơn điện nước nào"
          />
          <div className="p-4 border-t">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / PAGE_SIZE) || 1}
              onPageChange={setPage}
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ChiTietDienNuocPage;
