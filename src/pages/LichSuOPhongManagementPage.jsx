import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Button from "../components/ui/Button";
import lichSuOPhongService from "../services/api/lichSuOPhongService";
import roomService from "../services/api/roomService";
import studentService from "../services/api/studentService";
import Card from "../components/ui/Card";
import { Search, Filter } from "lucide-react";
import formatDateTimeVN from "../utils/formatDateTimeVN";

const columns = [
  { title: "Mã SV", key: "MaSinhVien" },
  {
    title: "Tên SV",
    key: "SinhVien",
    render: (value, row) => value?.HoTen || "N/A",
  },
  { title: "Mã Phòng", key: "MaPhong" },
  {
    title: "Số Phòng",
    key: "Phong",
    render: (value, row) => value?.SoPhong || "N/A",
  },
  {
    title: "Ngày Bắt Đầu",
    key: "NgayBatDau",
    render: (value) => (value ? formatDateTimeVN(true, value) : "Chưa có"),
  },
  {
    title: "Ngày Kết Thúc",
    key: "NgayKetThuc",
    render: (value) => (value ? formatDateTimeVN(true, value) : "Chưa có"),
  },
  { title: "Người Tạo", key: "NguoiTao" },
  {
    title: "Ngày Tạo",
    key: "NgayTao",
    render: (value) => (value ? formatDateTimeVN(false, value) : "N/A"),
  },
];

function LichSuOPhongManagementPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ MaSinhVien: "", MaPhong: "" });
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch room and student list on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const roomRes = await roomService.getAll({ limit: 1000 });
        setRooms(Array.isArray(roomRes.data) ? roomRes.data : roomRes);
        const studentRes = await studentService.getAll({ limit: 1000 });
        setStudents(
          Array.isArray(studentRes.data) ? studentRes.data : studentRes
        );
      } catch (err) {
        setRooms([]);
        setStudents([]);
      }
    };
    fetchOptions();
  }, []);

  const fetchData = async (
    page = 1,
    limit = 10,
    MaSinhVien = "",
    MaPhong = ""
  ) => {
    setLoading(true);
    try {
      const res = await lichSuOPhongService.getLichSuOPhongList({
        page,
        limit,
        MaSinhVien,
        MaPhong,
      });
      setData(Array.isArray(res.data) ? res.data : []);
      setPagination({
        page: res.pagination?.currentPage || 1,
        limit: res.pagination?.itemsPerPage || 10,
        total: res.pagination?.totalItems || 0,
      });
    } catch (err) {
      setData([]);
      setPagination({ page: 1, limit: 10, total: 0 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(
      pagination.page,
      pagination.limit,
      filters.MaSinhVien,
      filters.MaPhong
    );
  }, [filters, pagination.page, pagination.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    // fetchData sẽ tự động chạy lại do useEffect phụ thuộc vào filters và pagination
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    // fetchData sẽ tự động chạy lại do useEffect phụ thuộc vào filters và pagination
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý lịch sử ở phòng
          </h1>
          <p className="text-gray-600">
            Xem và lọc lịch sử ở phòng của sinh viên trong ký túc xá
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm theo mã SV, tên..."
                  value={filters.MaSinhVien}
                  name="MaSinhVien"
                  onChange={handleFilterChange}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  list="student-list"
                />
                <datalist id="student-list">
                  {students.map((sv) => (
                    <option key={sv.MaSinhVien} value={sv.MaSinhVien}>
                      {sv.MaSinhVien} - {sv.HoTen}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="w-full md:w-48">
                <select
                  name="MaPhong"
                  value={filters.MaPhong}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả phòng</option>
                  {rooms.map((room) => (
                    <option key={room.MaPhong} value={room.MaPhong}>
                      {room.SoPhong} - {room.LoaiPhong}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ MaSinhVien: "", MaPhong: "" });
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="h-10 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Xóa lọc
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            data={data}
            loading={loading}
            rowKey="ID"
            emptyText="Không có dữ liệu lịch sử ở phòng"
          />
          {pagination.total > pagination.limit && (
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.limit)}
              onPageChange={handlePageChange}
              className="border-t border-gray-200"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}

export default LichSuOPhongManagementPage;
