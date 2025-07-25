import api from "../../utils/api";

export const employeeService = {
  // Get all employees
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/nhan-vien?${queryString}`);
    return response.data;
  },

  // Get employee by ID
  getById: async (id) => {
    const response = await api.get(`/nhan-vien/${id}`);
    return response.data;
  },

  // Create new employee
  create: async (data) => {
    const response = await api.post("/nhan-vien", data);
    return response.data;
  },

  // Update employee
  update: async (id, data) => {
    const response = await api.put(`/nhan-vien/${id}`, data);
    return response.data;
  },

  // Check if employee can be deleted
  canDelete: async (id) => {
    const response = await api.get(`/nhan-vien/${id}/can-delete`);
    return response.data;
  },

  // Delete employee
  delete: async (id) => {
    const response = await api.delete(`/nhan-vien/${id}`);
    return response.data;
  },

  // Get employee statistics
  getStats: async () => {
    const response = await api.get("/nhan-vien/stats");
    return response.data;
  },

  // Get available roles
  getRoles: async () => {
    const response = await api.get("/nhan-vien/roles");
    return response.data;
  },

  // Search employees
  search: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return await employeeService.getAll(params);
  },

  // Get employees by role
  getByRole: async (role) => {
    const params = { vaiTro: role };
    return await employeeService.getAll(params);
  },

  // Get employees by status
  getByStatus: async (status) => {
    const params = { trangThai: status };
    return await employeeService.getAll(params);
  },
};

export default employeeService;
