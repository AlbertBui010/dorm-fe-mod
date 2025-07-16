import api from "../../utils/api";

export const chiSoDienNuocService = {
  async getChiSoDienNuoc(params = {}) {
    const response = await api.get("/chi-so-dien-nuoc", { params });
    return response.data;
  },

  async getChiSoDienNuocById(id) {
    const response = await api.get(`/chi-so-dien-nuoc/${id}`);
    return response.data;
  },

  async createChiSoDienNuoc(data) {
    const response = await api.post("/chi-so-dien-nuoc", data);
    return response.data;
  },

  async updateChiSoDienNuoc(id, data) {
    const response = await api.put(`/chi-so-dien-nuoc/${id}`, data);
    return response.data;
  },
};

export default chiSoDienNuocService;
