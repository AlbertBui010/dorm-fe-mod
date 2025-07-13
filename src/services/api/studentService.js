import api from "../../utils/api";

export const studentService = {
  // Get all students
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/sinh-vien?${queryString}`);
    return response.data;
  },

  // Get students without bed
  getWithoutBed: async (gioiTinhPhong) => {
    const params = gioiTinhPhong ? { gioiTinhPhong } : {};
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/sinh-vien/without-bed?${queryString}`);
    return response.data;
  },

  // Get student by ID
  getById: async (id) => {
    const response = await api.get(`/sinh-vien/${id}`);
    return response.data;
  },

  // Create new student
  create: async (data) => {
    const response = await api.post("/sinh-vien", data);
    return response.data;
  },

  // Update student
  update: async (id, data) => {
    const response = await api.put(`/sinh-vien/${id}`, data);
    return response.data;
  },

  // Toggle student status (Active/Inactive)
  toggleStatus: async (id) => {
    const response = await api.patch(`/sinh-vien/${id}/toggle-status`);
    return response.data;
  },

  // Delete student
  delete: async (id) => {
    const response = await api.delete(`/sinh-vien/${id}`);
    return response.data;
  },

  // Get student statistics
  getStats: async () => {
    const response = await api.get("/sinh-vien/stats");
    return response.data;
  },

  // Get student profile (for authenticated student)
  getProfile: async () => {
    const response = await api.get("/sinh-vien/profile");
    return response.data;
  },

  // Update student profile (for authenticated student)
  updateProfile: async (data) => {
    const response = await api.put("/sinh-vien/profile", data);
    return response.data;
  },

  // Change student password (for authenticated student)
  changePassword: async (data) => {
    const response = await api.put("/sinh-vien/profile/password", data);
    return response.data;
  },

  // Search students
  search: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return await studentService.getAll(params);
  },

  // Get students by room
  getByRoom: async (roomId) => {
    const params = { phongId: roomId };
    return await studentService.getAll(params);
  },

  // Get students by status
  getByStatus: async (status) => {
    const params = { trangThai: status };
    return await studentService.getAll(params);
  },

  // Get students by year
  getByYear: async (year) => {
    const params = { namHoc: year };
    return await studentService.getAll(params);
  },
};

export default studentService;
