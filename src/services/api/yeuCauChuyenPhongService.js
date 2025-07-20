import api from "../../utils/api";

class YeuCauChuyenPhongService {
  // Lấy danh sách phòng và giường có sẵn
  async getAvailableRoomsAndBeds() {
    try {
      const response = await api.get(
        "/yeu-cau-chuyen-phong/available-rooms-beds"
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi tải danh sách phòng và giường"
      );
    }
  }

  // Lấy danh sách yêu cầu chuyển phòng (admin)
  async getYeuCauChuyenPhongList(params = {}) {
    try {
      const response = await api.get("/yeu-cau-chuyen-phong", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tải danh sách yêu cầu chuyển phòng"
      );
    }
  }

  // Lấy chi tiết yêu cầu chuyển phòng
  async getYeuCauChuyenPhongById(id) {
    try {
      const response = await api.get(`/yeu-cau-chuyen-phong/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tải thông tin yêu cầu chuyển phòng"
      );
    }
  }

  // Tạo yêu cầu chuyển phòng (sinh viên)
  async createYeuCauChuyenPhong(data) {
    try {
      const response = await api.post("/yeu-cau-chuyen-phong", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi tạo yêu cầu chuyển phòng"
      );
    }
  }

  // Cập nhật yêu cầu chuyển phòng
  async updateYeuCauChuyenPhong(id, data) {
    try {
      const response = await api.put(`/yeu-cau-chuyen-phong/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi cập nhật yêu cầu chuyển phòng"
      );
    }
  }

  // Duyệt yêu cầu chuyển phòng (admin)
  async approveYeuCauChuyenPhong(id, data) {
    try {
      const response = await api.post(`/yeu-cau-chuyen-phong/${id}/approve`, {
        ghiChu: data.lyDoDuyet,
        selectedRoom: data.selectedRoom,
        selectedBed: data.selectedBed,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi duyệt yêu cầu chuyển phòng"
      );
    }
  }

  // Từ chối yêu cầu chuyển phòng (admin)
  async rejectYeuCauChuyenPhong(id, data) {
    try {
      const response = await api.post(
        `/yeu-cau-chuyen-phong/${id}/reject`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi từ chối yêu cầu chuyển phòng"
      );
    }
  }

  // Lấy yêu cầu chuyển phòng của sinh viên
  async getMyYeuCauChuyenPhong() {
    try {
      const response = await api.get("/yeu-cau-chuyen-phong/my-requests");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tải yêu cầu chuyển phòng của bạn"
      );
    }
  }

  // Lấy chi tiết yêu cầu chuyển phòng của sinh viên
  async getMyYeuCauChuyenPhongById(id) {
    try {
      const response = await api.get(`/yeu-cau-chuyen-phong/my-requests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tải chi tiết yêu cầu chuyển phòng"
      );
    }
  }

  // Lấy thống kê yêu cầu chuyển phòng (admin)
  async getYeuCauChuyenPhongStats() {
    try {
      const response = await api.get("/yeu-cau-chuyen-phong/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tải thống kê yêu cầu chuyển phòng"
      );
    }
  }

  // Lấy danh sách phòng có thể chuyển đến
  async getAvailableRooms(gioiTinh) {
    try {
      const response = await api.get(
        `/phong?trangThai=available&loaiPhong=${gioiTinh}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi tải danh sách phòng có sẵn"
      );
    }
  }

  // Sinh viên tạo yêu cầu chuyển phòng
  async createMyYeuCauChuyenPhong(data) {
    try {
      const response = await api.post(
        "/yeu-cau-chuyen-phong/my-requests",
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi tạo yêu cầu chuyển phòng"
      );
    }
  }
}

export default new YeuCauChuyenPhongService();
