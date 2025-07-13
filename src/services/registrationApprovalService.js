import { api } from "./api";

/**
 * Service cho quản lý duyệt đăng ký ký túc xá (UC8)
 */
class RegistrationApprovalService {
  /**
   * Lấy danh sách đăng ký chờ duyệt
   */
  async getPendingRegistrations(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        gioiTinh = "",
        nguyenVong = "",
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(gioiTinh && { gioiTinh }),
        ...(nguyenVong && { nguyenVong }),
      });

      const response = await api.get(`/registration-approval?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      throw error;
    }
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getRegistrationStats() {
    try {
      const response = await api.get("/registration-approval/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching registration stats:", error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết đăng ký
   */
  async getRegistrationDetail(maDangKy) {
    try {
      const response = await api.get(`/registration-approval/${maDangKy}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching registration detail:", error);
      throw error;
    }
  }

  /**
   * Tìm phòng có sẵn cho đăng ký
   */
  async findAvailableRooms(maDangKy, params = {}) {
    try {
      const { page = 1, limit = 10 } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(
        `/registration-approval/${maDangKy}/available-rooms?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error("Error finding available rooms:", error);
      throw error;
    }
  }

  /**
   * Duyệt đăng ký
   */
  async approveRegistration(maDangKy, approvalData) {
    try {
      const response = await api.post(
        `/registration-approval/${maDangKy}/approve`,
        approvalData
      );
      return response.data;
    } catch (error) {
      console.error("Error approving registration:", error);
      throw error;
    }
  }

  /**
   * Từ chối đăng ký
   */
  async rejectRegistration(maDangKy, rejectData) {
    try {
      const response = await api.post(
        `/registration-approval/${maDangKy}/reject`,
        rejectData
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting registration:", error);
      throw error;
    }
  }
}

export default new RegistrationApprovalService();
