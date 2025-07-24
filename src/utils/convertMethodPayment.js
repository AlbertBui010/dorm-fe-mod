export const convertMethodPayment = (method) => {
  switch (method) {
    case "TIEN_MAT":
      return "Tiền mặt";
    case "CHUYEN_KHOAN":
      return "Chuyển khoản";
  }
};
