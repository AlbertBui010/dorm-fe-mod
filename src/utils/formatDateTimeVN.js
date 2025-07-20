// Định dạng ngày tháng giờ theo chuẩn Việt Nam
const formatDateTimeVN = (isOnlyDate, dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  if (isOnlyDate) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } else {
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }
};

export default formatDateTimeVN;
