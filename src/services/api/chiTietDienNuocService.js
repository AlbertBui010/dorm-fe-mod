import api from "../../utils/api";

const chiTietDienNuocService = {
  // Admin/Nhân viên: lấy tất cả hoặc filter
  getAll: async (params = {}) => {
    const response = await api.get("/chi-tiet-dien-nuoc", { params });
    return response.data;
  },

  // Lấy chi tiết điện nước theo ID
  getById: async (id) => {
    const response = await api.get(`/chi-tiet-dien-nuoc/${id}`);
    return response.data;
  },

  // Sinh viên: lấy chi tiết điện nước của mình
  getMine: async (params = {}) => {
    const response = await api.get("/chi-tiet-dien-nuoc/me", { params });
    return response.data;
  },
};

export default chiTietDienNuocService;
