import api from "../utils/api";

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return response.data;
    }
    throw new Error(response.data.message);
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.post("/auth/change-password", passwords);
    return response.data;
  },

  // Set password (for students)
  setPassword: async (password) => {
    const response = await api.post("/auth/set-password", {
      newPassword: password,
    });
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export const sinhVienService = {
  // Get all students
  getAll: async (params = {}) => {
    const response = await api.get("/sinh-vien", { params });
    return response.data;
  },

  // Get student by ID
  getById: async (id) => {
    const response = await api.get(`/sinh-vien/${id}`);
    return response.data;
  },

  // Create student
  create: async (studentData) => {
    const response = await api.post("/sinh-vien", studentData);
    return response.data;
  },

  // Update student
  update: async (id, studentData) => {
    const response = await api.put(`/sinh-vien/${id}`, studentData);
    return response.data;
  },

  // Delete student
  delete: async (id) => {
    const response = await api.delete(`/sinh-vien/${id}`);
    return response.data;
  },
};

export const phongService = {
  // Get all rooms
  getAll: async (params = {}) => {
    const response = await api.get("/phong", { params });
    return response.data;
  },

  // Get available rooms
  getAvailable: async () => {
    const response = await api.get("/phong/available");
    return response.data;
  },

  // Get room by ID
  getById: async (id) => {
    const response = await api.get(`/phong/${id}`);
    return response.data;
  },

  // Create room
  create: async (roomData) => {
    const response = await api.post("/phong", roomData);
    return response.data;
  },

  // Update room
  update: async (id, roomData) => {
    const response = await api.put(`/phong/${id}`, roomData);
    return response.data;
  },

  // Delete room
  delete: async (id) => {
    const response = await api.delete(`/phong/${id}`);
    return response.data;
  },
};

// Export the api instance for direct use
export { default as api } from "../utils/api";
