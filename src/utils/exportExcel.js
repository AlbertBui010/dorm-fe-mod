import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

/**
 * Export data to Excel file
 * @param {Object} options - Export options
 * @param {Array} options.data - Array of data to export
 * @param {Array} options.columns - Array of column definitions
 * @param {string} options.filename - Base filename (without extension)
 * @param {string} options.sheetName - Worksheet name
 * @param {Object} options.columnWidths - Column widths mapping
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export const exportToExcel = ({
  data = [],
  columns = [],
  filename = "export",
  sheetName = "Data",
  columnWidths = {},
  onSuccess = null,
  onError = null,
}) => {
  try {
    if (!data || data.length === 0) {
      toast.error("Không có dữ liệu để export");
      return false;
    }

    // Transform data based on column definitions
    const excelData = data.map((item, index) => {
      const row = { STT: index + 1 };

      columns.forEach((col) => {
        if (col.excelKey && col.excelLabel) {
          if (col.transform && typeof col.transform === "function") {
            row[col.excelLabel] = col.transform(
              item[col.excelKey] || item,
              item,
              index
            );
          } else {
            row[col.excelLabel] = item[col.excelKey] || "";
          }
        }
      });

      return row;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths if provided
    if (Object.keys(columnWidths).length > 0) {
      const colWidths = [];
      const headers = Object.keys(excelData[0] || {});

      headers.forEach((header) => {
        colWidths.push({
          wch: columnWidths[header] || 15,
        });
      });

      worksheet["!cols"] = colWidths;
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, "")
      .replace("T", "_");
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, fullFilename);

    const successMessage = `Đã export ${excelData.length} bản ghi ra file Excel`;
    toast.success(successMessage);

    if (onSuccess && typeof onSuccess === "function") {
      onSuccess({ count: excelData.length, filename: fullFilename });
    }

    return true;
  } catch (error) {
    console.error("Error exporting Excel:", error);
    const errorMessage = "Lỗi khi export Excel";
    toast.error(errorMessage);

    if (onError && typeof onError === "function") {
      onError(error);
    }

    return false;
  }
};

/**
 * Common column width presets
 */
export const COLUMN_WIDTHS = {
  STT: 5,
  ID: 15,
  CODE: 12,
  NAME: 20,
  DATE: 15,
  DATETIME: 18,
  PHONE: 12,
  EMAIL: 25,
  ADDRESS: 30,
  AMOUNT: 15,
  STATUS: 12,
  DESCRIPTION: 30,
  DEFAULT: 15,
};

/**
 * Common transform functions
 */
export const TRANSFORMS = {
  // Format currency
  currency: (value) => {
    if (!value || isNaN(value)) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  },

  // Format date
  date: (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("vi-VN");
  },

  // Format datetime
  datetime: (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("vi-VN");
  },

  // Format boolean
  boolean: (value) => {
    return value ? "Có" : "Không";
  },

  // Format status
  status: (value, statusMapping = {}) => {
    return statusMapping[value] || value || "N/A";
  },

  // Calculate difference
  difference: (value, item, index, fromKey, toKey) => {
    const from = Number(item[fromKey]) || 0;
    const to = Number(item[toKey]) || 0;
    return to - from;
  },
};

/**
 * Pre-built export configurations for common data types
 */
export const EXPORT_CONFIGS = {
  // Room management
  rooms: {
    filename: "danh_sach_phong",
    sheetName: "Danh sách phòng",
    columns: [
      { excelKey: "SoPhong", excelLabel: "Số phòng" },
      { excelKey: "LoaiPhong", excelLabel: "Loại phòng" },
      { excelKey: "SucChua", excelLabel: "Sức chứa" },
      { excelKey: "DienTich", excelLabel: "Diện tích (m²)" },
      {
        excelKey: "GiaThueThang",
        excelLabel: "Giá phòng",
        transform: TRANSFORMS.currency,
      },
      {
        excelKey: "TrangThai",
        excelLabel: "Trạng thái",
        transform: (value) =>
          TRANSFORMS.status(value, {
            HOAT_DONG: "Hoạt động",
            KHOA: "Đã khóa",
            BAO_TRI: "Bảo trì",
          }),
      },
      {
        excelKey: "NgayTao",
        excelLabel: "Ngày tạo",
        transform: TRANSFORMS.date,
      },
    ],
    columnWidths: {
      STT: COLUMN_WIDTHS.STT,
      "Số phòng": COLUMN_WIDTHS.CODE,
      "Loại phòng": COLUMN_WIDTHS.NAME,
      "Sức chứa": COLUMN_WIDTHS.DEFAULT,
      "Diện tích (m²)": COLUMN_WIDTHS.DEFAULT,
      "Giá phòng": COLUMN_WIDTHS.AMOUNT,
      "Trạng thái": COLUMN_WIDTHS.STATUS,
      "Ngày tạo": COLUMN_WIDTHS.DATE,
    },
  },

  // Electric water index
  electricWater: {
    filename: "chi_so_dien_nuoc",
    sheetName: "Chỉ số điện nước",
    columns: [
      { excelKey: "MaChiSo", excelLabel: "Mã chỉ số" },
      { excelKey: "SoPhong", excelLabel: "Số phòng" },
      { excelKey: "ThangNam", excelLabel: "Tháng/Năm" },
      { excelKey: "SoDienCu", excelLabel: "Số điện cũ" },
      { excelKey: "SoDienMoi", excelLabel: "Số điện mới" },
      {
        excelKey: "TieuThuDien",
        excelLabel: "Tiêu thụ điện",
        transform: (value, item) =>
          (item.SoDienMoi || 0) - (item.SoDienCu || 0),
      },
      { excelKey: "SoNuocCu", excelLabel: "Số nước cũ" },
      { excelKey: "SoNuocMoi", excelLabel: "Số nước mới" },
      {
        excelKey: "TieuThuNuoc",
        excelLabel: "Tiêu thụ nước",
        transform: (value, item) =>
          (item.SoNuocMoi || 0) - (item.SoNuocCu || 0),
      },
      {
        excelKey: "NgayTao",
        excelLabel: "Ngày tạo",
        transform: TRANSFORMS.date,
      },
      {
        excelKey: "NgayCapNhat",
        excelLabel: "Ngày cập nhật",
        transform: TRANSFORMS.date,
      },
    ],
    columnWidths: {
      STT: COLUMN_WIDTHS.STT,
      "Mã chỉ số": COLUMN_WIDTHS.ID,
      "Số phòng": COLUMN_WIDTHS.CODE,
      "Tháng/Năm": COLUMN_WIDTHS.DEFAULT,
      "Số điện cũ": COLUMN_WIDTHS.DEFAULT,
      "Số điện mới": COLUMN_WIDTHS.DEFAULT,
      "Tiêu thụ điện": COLUMN_WIDTHS.DEFAULT,
      "Số nước cũ": COLUMN_WIDTHS.DEFAULT,
      "Số nước mới": COLUMN_WIDTHS.DEFAULT,
      "Tiêu thụ nước": COLUMN_WIDTHS.DEFAULT,
      "Ngày tạo": COLUMN_WIDTHS.DATE,
      "Ngày cập nhật": COLUMN_WIDTHS.DATE,
    },
  },

  // Electric water detail/bill
  electricWaterDetail: {
    filename: "hoa_don_dien_nuoc",
    sheetName: "Hóa đơn điện nước",
    columns: [
      { excelKey: "ID", excelLabel: "ID" },
      { excelKey: "MaSinhVien", excelLabel: "Mã sinh viên" },
      { excelKey: "MaChiSo", excelLabel: "Mã chỉ số" },
      {
        excelKey: "SoPhong",
        excelLabel: "Số phòng",
        transform: (value, item) => {
          // Hiển thị thông tin phòng từ các nguồn khác nhau
          if (item.ChiSoDienNuoc?.Phong?.SoPhong) {
            return item.ChiSoDienNuoc.Phong.SoPhong;
          }
          if (item.SinhVien?.Giuong?.Phong?.SoPhong) {
            return item.SinhVien.Giuong.Phong.SoPhong;
          }
          return item.SoPhong || "-";
        },
      },
      { excelKey: "SoNgayO", excelLabel: "Số ngày ở" },
      {
        excelKey: "TienDien",
        excelLabel: "Tiền điện",
        transform: TRANSFORMS.currency,
      },
      {
        excelKey: "TienNuoc",
        excelLabel: "Tiền nước",
        transform: TRANSFORMS.currency,
      },
      {
        excelKey: "TongTien",
        excelLabel: "Tổng tiền",
        transform: (value, item) => {
          const tienDien = Number(item.TienDien) || 0;
          const tienNuoc = Number(item.TienNuoc) || 0;
          return TRANSFORMS.currency(tienDien + tienNuoc);
        },
      },
      {
        excelKey: "ThangNam",
        excelLabel: "Tháng/Năm",
        transform: (value, item) => item.ChiSoDienNuoc?.ThangNam || "",
      },
      {
        excelKey: "NgayTao",
        excelLabel: "Ngày tạo",
        transform: TRANSFORMS.date,
      },
    ],
    columnWidths: {
      STT: COLUMN_WIDTHS.STT,
      ID: COLUMN_WIDTHS.ID,
      "Mã sinh viên": COLUMN_WIDTHS.CODE,
      "Mã chỉ số": COLUMN_WIDTHS.ID,
      "Số phòng": COLUMN_WIDTHS.CODE,
      "Số ngày ở": COLUMN_WIDTHS.DEFAULT,
      "Tiền điện": COLUMN_WIDTHS.AMOUNT,
      "Tiền nước": COLUMN_WIDTHS.AMOUNT,
      "Tổng tiền": COLUMN_WIDTHS.AMOUNT,
      "Tháng/Năm": COLUMN_WIDTHS.DEFAULT,
      "Ngày tạo": COLUMN_WIDTHS.DATE,
    },
  },
};
