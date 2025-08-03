import { useEffect, useState } from "react";
import chiTietDienNuocService from "../services/api/chiTietDienNuocService";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { authService } from "../services/api/authService";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";

const columns = [
  { key: "ID", title: "ID" },
  { key: "MaSinhVien", title: "Mã SV" },
  { key: "MaChiSo", title: "Mã Chỉ Số" },
  { key: "SoNgayO", title: "Số Ngày Ở" },
  { key: "TienDien", title: "Tiền Điện" },
  { key: "TienNuoc", title: "Tiền Nước" },
  {
    key: "ChiSoDienNuoc.ThangNam",
    title: "Tháng Năm",
    render: (v, row) => row.ChiSoDienNuoc?.ThangNam || "",
  },
  {
    key: "NgayTao",
    title: "Ngày Tạo",
    render: (v) => (v ? new Date(v).toLocaleDateString() : ""),
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      };
      if (search) params.MaSinhVien = search;
      if (thangNam) params.ThangNam = thangNam;
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
    // eslint-disable-next-line
  }, [page, isAdmin]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleThangNam = (e) => {
    setThangNam(e.target.value);
    setPage(1);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi Tiết Điện Nước
            </h1>
            <p className="text-gray-600">
              Tra cứu chi tiết tiền điện nước theo sinh viên và tháng
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 items-end">
              {isAdmin && (
                <Input
                  label="Tìm theo mã sinh viên"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Nhập mã sinh viên..."
                  className="w-48"
                />
              )}
              <Input
                label="Tháng Năm"
                value={thangNam}
                onChange={handleThangNam}
                placeholder="MM/YYYY"
                className="w-40"
              />
              <Button onClick={fetchData} className="ml-2">
                Tìm kiếm
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setThangNam("");
                  setPage(1);
                }}
              >
                Xoá bộ lọc
              </Button>
            </div>
          </div>
        </Card>

        {/* Bảng danh sách */}
        <Card>
          <Table
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Không có dữ liệu chi tiết điện nước"
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
