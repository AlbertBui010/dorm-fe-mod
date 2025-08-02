import api from "../../utils/api";

export const authService = {
  // Login (support both endpoints)
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Student login (specific endpoint)
  studentLogin: async (credentials) => {
    try {
      const response = await api.post("/auth/student/login", credentials);
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Get profile
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Change password
  changePassword: async (passwords) => {
    try {
      const response = await api.post("/auth/change-password", passwords);
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Set password (for students)
  setPassword: async (password) => {
    try {
      const response = await api.post("/auth/set-password", {
        newPassword: password,
      });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Forgot password - send reset email
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
  },

  // Reset password with token
  resetPassword: async (email, token, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw authService.handleError(error);
    }
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

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Get user
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Error handling helper
  handleError: (error) => {
    if (error.response) {
      // API responded with error status
      const { data, status } = error.response;

      // Handle specific status codes
      if (status === 401) {
        authService.logout(); // Auto logout on unauthorized
        return new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      if (status === 403) {
        return new Error("Bạn không có quyền thực hiện hành động này.");
      }

      if (status >= 500) {
        return new Error("Lỗi server. Vui lòng thử lại sau.");
      }

      return new Error(data?.message || "Có lỗi xảy ra");
    } else if (error.request) {
      // Network error
      return new Error(
        "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng."
      );
    } else {
      // Other error
      return new Error(error.message || "Có lỗi xảy ra");
    }
  },
};

export default authService;
