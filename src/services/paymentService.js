import { api } from "./api";

class PaymentService {
  /**
   * Lấy danh sách thanh toán của sinh viên
   */
  async getMyPayments(params = {}) {
    try {
      const { page = 1, limit = 10, trangThai } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(trangThai && { trangThai }),
      });

      const response = await api.get(`/payments?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Lấy danh sách tất cả thanh toán (admin)
   */
  async getPayments(params = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        type = "",
        month = "",
        startDate = "",
        endDate = "",
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(type && { type }),
        ...(month && { month }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await api.get(`/payments/admin?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Lấy thống kê thanh toán
   */
  async getPaymentStats() {
    try {
      const response = await api.get("/payments/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Lấy thống kê thanh toán admin
   */
  async getAdminStats() {
    try {
      const response = await api.get("/payments/admin/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Lấy chi tiết thanh toán
   */
  async getPaymentDetail(maThanhToan) {
    try {
      const response = await api.get(`/payments/${maThanhToan}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Tạo link thanh toán PayOS
   */
  async createPaymentLink(maThanhToan) {
    try {
      const response = await api.post(
        `/payments/${maThanhToan}/create-payment-link`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Xử lý thanh toán tiền mặt
   */
  async processCashPayment(maThanhToan, data = {}) {
    try {
      const response = await api.post(
        `/payments/${maThanhToan}/cash-payment`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Phê duyệt thanh toán tiền mặt (admin)
   */
  async approveCashPayment(maThanhToan, data = {}) {
    try {
      const response = await api.post(
        `/payments/admin/${maThanhToan}/approve-cash`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Từ chối thanh toán tiền mặt (admin)
   */
  async rejectCashPayment(maThanhToan, data = {}) {
    try {
      const response = await api.post(
        `/payments/admin/${maThanhToan}/reject-cash`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async checkPaymentStatus(maThanhToan) {
    try {
      const response = await api.get(`/payments/${maThanhToan}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Format số tiền VND
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  /**
   * Format trạng thái thanh toán
   */
  formatPaymentStatus(status) {
    const statusMap = {
      CHUA_THANH_TOAN: { text: "Chưa thanh toán", color: "red" },
      DANG_CHO_THANH_TOAN: { text: "Đang chờ thanh toán", color: "blue" },
      DA_THANH_TOAN: { text: "Đã thanh toán", color: "green" },
      CHO_XAC_NHAN: { text: "Chờ xác nhận", color: "orange" },
      QUA_HAN: { text: "Quá hạn", color: "red" },
    };
    return statusMap[status] || { text: status, color: "gray" };
  }

  /**
   * Format loại thanh toán
   */
  formatPaymentType(type) {
    const typeMap = {
      TIEN_PHONG: "Tiền phòng",
      TIEN_DIEN: "Tiền điện",
      TIEN_NUOC: "Tiền nước",
    };
    return typeMap[type] || type;
  }

  /**
   * Format hình thức thanh toán
   */
  formatPaymentMethod(method) {
    const methodMap = {
      TIEN_MAT: "Tiền mặt",
      CHUYEN_KHOAN: "Chuyển khoản",
    };
    return methodMap[method] || method;
  }
}

export default new PaymentService();
