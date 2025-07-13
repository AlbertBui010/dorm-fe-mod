import api from "../../utils/api";

export const studentPaymentService = {
  /**
   * Lấy danh sách thanh toán của sinh viên
   */
  async getMyPayments(params = {}) {
    try {
      const { page = 1, limit = 10, trangThai = "" } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (trangThai) {
        queryParams.append("trangThai", trangThai);
      }

      const response = await api.get(`/payments?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student payments:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải danh sách thanh toán"
      );
    }
  },

  /**
   * Lấy chi tiết thanh toán
   */
  async getPaymentDetail(maThanhToan) {
    try {
      const response = await api.get(`/payments/${maThanhToan}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment detail:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải chi tiết thanh toán"
      );
    }
  },

  /**
   * Tạo link thanh toán online
   */
  async createPaymentLink(maThanhToan) {
    try {
      const response = await api.post(
        `/payments/${maThanhToan}/create-payment-link`
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment link:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tạo link thanh toán"
      );
    }
  },

  /**
   * Đăng ký thanh toán tiền mặt
   */
  async processCashPayment(maThanhToan) {
    try {
      const response = await api.post(`/payments/${maThanhToan}/cash-payment`);
      return response.data;
    } catch (error) {
      console.error("Error processing cash payment:", error);
      throw new Error(
        error.response?.data?.message || "Không thể xử lý thanh toán tiền mặt"
      );
    }
  },

  /**
   * Lấy thống kê thanh toán của sinh viên
   */
  async getPaymentStats() {
    try {
      const response = await api.get("/payments/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải thống kê thanh toán"
      );
    }
  },
};

export default studentPaymentService;
