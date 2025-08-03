import api from "../../utils/api";

/**
 * Registration API for UC7: Student self-registration for dormitory
 */
class RegistrationAPI {
  /**
   * Step 1: Register student basic information
   */
  async register(registrationData) {
    try {
      const response = await api.post(
        "/registration/register",
        registrationData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Step 2A: Verify email via POST API
   */
  async verifyEmail(token) {
    try {
      const response = await api.post("/registration/verify-email", { token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Step 3: Setup password after email verification
   */
  async setupPassword(passwordData) {
    try {
      const response = await api.post(
        "/registration/setup-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Utility: Resend verification email
   */
  async resendVerification(email) {
    try {
      const response = await api.post("/registration/resend-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Utility: Get registration status
   */
  async getRegistrationStatus(maSinhVien) {
    try {
      const response = await api.get(`/registration/status/${maSinhVien}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Utility: Check if email/student ID exists
   */
  async checkExisting(data) {
    try {
      const response = await api.post("/registration/check-existing", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Utility: Calculate end date based on receive date
   */
  async calculateEndDate(data) {
    try {
      const response = await api.post("/registration/calculate-end-date", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Utility: Renew contract (student self-renew)
   */
  async cancelRenewContract(maSinhVien) {
    try {
      const response = await api.post("/registration/cancel-renew", {
        maSinhVien,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleError(error) {
    const response = error.response;

    if (!response) {
      return new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
      );
    }

    const { status, data } = response;

    // Handle specific error cases
    switch (status) {
      case 400:
        return new Error(data.message || "Dữ liệu không hợp lệ.");
      case 409:
        // Duplicate registration case
        const errorWithData = new Error(
          data.message || "Thông tin đã tồn tại."
        );
        errorWithData.shouldLogin = data.shouldLogin;
        errorWithData.existingStudent = data.existingStudent;
        return errorWithData;
      case 404:
        return new Error(data.message || "Không tìm thấy thông tin.");
      case 500:
        return new Error("Lỗi server. Vui lòng thử lại sau.");
      default:
        return new Error(data.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }
}

export default new RegistrationAPI();
