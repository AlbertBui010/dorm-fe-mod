import api from "../../utils/api";

export const roomService = {
  // Get all rooms
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/phong?${queryString}`);
    return response.data;
  },

  // Get room by ID
  getById: async (id) => {
    const response = await api.get(`/phong/${id}`);
    return response.data;
  },

  // Create new room
  create: async (data) => {
    const response = await api.post("/phong", data);
    return response.data;
  },

  // Update room
  update: async (id, data) => {
    const response = await api.put(`/phong/${id}`, data);
    return response.data;
  },

  // Delete room
  delete: async (id) => {
    const response = await api.delete(`/phong/${id}`);
    return response.data;
  },

  // Get room statistics
  getStatistics: async () => {
    const response = await api.get("/phong/statistics");
    return response.data;
  },

  // Get available rooms
  getAvailable: async () => {
    const response = await api.get("/phong/available");
    return response.data;
  },

  // Get room occupancy details
  getOccupancy: async (id) => {
    const response = await api.get(`/phong/${id}/occupancy`);
    return response.data;
  },

  // Get rooms by building
  getByBuilding: async (building) => {
    const params = { toaNha: building };
    return await roomService.getAll(params);
  },

  // Get rooms by floor
  getByFloor: async (floor) => {
    const params = { tang: floor };
    return await roomService.getAll(params);
  },

  // Get rooms by gender
  getByGender: async (gender) => {
    const params = { gioiTinh: gender };
    return await roomService.getAll(params);
  },

  // Get rooms by capacity
  getByCapacity: async (capacity) => {
    const params = { sucChua: capacity };
    return await roomService.getAll(params);
  },

  // Search rooms
  search: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return await roomService.getAll(params);
  },

  // Get room history
  getHistory: async (id) => {
    const response = await api.get(`/phong/${id}/history`);
    return response.data;
  },

  // Check if room can be deleted
  canDelete: async (id) => {
    const response = await api.get(`/phong/${id}/can-delete`);
    return response.data;
  },
};

export default roomService;
