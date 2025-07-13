import api from "../../utils/api";

const donGiaDienNuocService = {
  // Lấy tất cả đơn giá với phân trang
  getAllDonGia: async (page = 1, limit = 10, search = "") => {
    const params = { page, limit };
    if (search) params.search = search;

    const response = await api.get("/don-gia-dien-nuoc", { params });
    return response.data;
  },

  // Lấy đơn giá theo ID
  getDonGiaById: async (id) => {
    const response = await api.get(`/don-gia-dien-nuoc/${id}`);
    return response.data;
  },

  // Lấy đơn giá hiện hành
  getCurrentDonGia: async () => {
    const response = await api.get("/don-gia-dien-nuoc/current");
    return response.data;
  },

  // Tạo đơn giá mới
  createDonGia: async (donGiaData) => {
    const response = await api.post("/don-gia-dien-nuoc", donGiaData);
    return response.data;
  },

  // Cập nhật đơn giá
  updateDonGia: async (id, donGiaData) => {
    const response = await api.put(`/don-gia-dien-nuoc/${id}`, donGiaData);
    return response.data;
  },

  // Xóa đơn giá
  deleteDonGia: async (id) => {
    const response = await api.delete(`/don-gia-dien-nuoc/${id}`);
    return response.data;
  },

  // Kiểm tra bản ghi liên quan
  checkRelatedRecords: async (id) => {
    const response = await api.get(`/don-gia-dien-nuoc/${id}/check-related`);
    return response.data;
  },

  // Kiểm tra có thể chỉnh sửa
  checkCanEdit: async (id) => {
    const response = await api.get(`/don-gia-dien-nuoc/${id}/can-edit`);
    return response.data;
  },

  // Kiểm tra có thể xóa
  checkCanDelete: async (id) => {
    const response = await api.get(`/don-gia-dien-nuoc/${id}/can-delete`);
    return response.data;
  },
};

export default donGiaDienNuocService;
