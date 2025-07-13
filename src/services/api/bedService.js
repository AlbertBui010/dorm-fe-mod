import api from "../../utils/api";

export const bedService = {
  // Get all beds with filtering and pagination
  async getAllBeds(params = {}) {
    const response = await api.get("/giuong", { params });
    return response.data;
  },

  // Get bed by ID
  async getBedById(maGiuong) {
    const response = await api.get(`/giuong/${maGiuong}`);
    return response.data;
  },

  // Create new bed
  async createBed(bedData) {
    const response = await api.post("/giuong", bedData);
    return response.data;
  },

  // Update bed
  async updateBed(maGiuong, bedData) {
    const response = await api.put(`/giuong/${maGiuong}`, bedData);
    return response.data;
  },

  // Delete bed
  async deleteBed(maGiuong) {
    const response = await api.delete(`/giuong/${maGiuong}`);
    return response.data;
  },

  // Assign student to bed
  async assignStudentToBed(maGiuong, assignData) {
    const response = await api.post(`/giuong/${maGiuong}/assign`, assignData);
    return response.data;
  },

  // Remove student from bed
  async removeStudentFromBed(maGiuong) {
    const response = await api.post(`/giuong/${maGiuong}/remove`);
    return response.data;
  },

  // Get beds by room
  async getBedsByRoom(maPhong) {
    const response = await api.get(`/giuong/room/${maPhong}`);
    return response.data;
  },

  // Get available beds
  async getAvailableBeds() {
    const response = await api.get("/giuong/available");
    return response.data;
  },

  // Get bed statistics
  async getBedStatistics() {
    const response = await api.get("/giuong/statistics");
    return response.data;
  },
};
