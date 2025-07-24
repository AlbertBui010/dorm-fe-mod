export const PAYMENT_TYPE = {
  TIEN_DIEN_NUOC: { key: "TIEN_DIEN_NUOC", value: "Tiền điện nước" },
  TIEN_PHONG: { key: "TIEN_PHONG", value: "Tiền phòng" },
};

export const PAYMENT_STATUS = {
  CHUA_THANH_TOAN: { key: "CHUA_THANH_TOAN", value: "Chưa thanh toán" },
  DANG_CHO_THANH_TOAN: {
    key: "DANG_CHO_THANH_TOAN",
    value: "Đang chờ thanh toán",
  },
  DA_THANH_TOAN: { key: "DA_THANH_TOAN", value: "Đã thanh toán" },
  HUY: { key: "HUY", value: "Hủy" },
  CHO_XAC_NHAN: { key: "CHO_XAC_NHAN", value: "Chờ xác nhận" },
};

export const PAYMENT_METHOD = {
  TIEN_MAT: { key: "TIEN_MAT", value: "Tiền mặt" },
  CHUYEN_KHOAN: { key: "CHUYEN_KHOAN", value: "Chuyển khoản" },
};
