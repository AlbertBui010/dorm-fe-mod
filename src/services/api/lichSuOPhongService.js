import api from "../../utils/api";

export const lichSuOPhongService = {
  async getLichSuOPhongList({
    page = 1,
    limit = 10,
    MaSinhVien = "",
    MaPhong = "",
  } = {}) {
    const params = { page, limit };
    if (MaSinhVien) params.MaSinhVien = MaSinhVien;
    if (MaPhong) params.MaPhong = MaPhong;
    const res = await api.get("/lich-su-o-phong", { params });
    return res.data;
  },
};

export default lichSuOPhongService;
