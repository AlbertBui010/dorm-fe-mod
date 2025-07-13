import React from 'react';

const RoomFeeCalculationModal = ({ isOpen, onClose, feeCalculation, studentName }) => {
  if (!isOpen || !feeCalculation) return null;

  const { chiTiet, soTien, tongSoThang, giaThueThang } = feeCalculation;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            💰 Chi tiết tính tiền phòng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Thông tin tổng quan */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📋 Thông tin tổng quan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sinh viên:</p>
              <p className="font-semibold">{studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giá thuê tháng:</p>
              <p className="font-semibold text-blue-600">
                {giaThueThang?.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Thời gian:</p>
              <p className="font-semibold">
                {chiTiet?.ngayBatDau} → {chiTiet?.ngayKetThuc}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số tháng:</p>
              <p className="font-semibold">{tongSoThang} tháng</p>
            </div>
          </div>
        </div>

        {/* Chi tiết theo tháng */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📊 Chi tiết tính theo tháng
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Tháng</th>
                  <th className="border border-gray-300 p-3 text-center">Ngày bắt đầu</th>
                  <th className="border border-gray-300 p-3 text-center">Hệ số</th>
                  <th className="border border-gray-300 p-3 text-right">Công thức</th>
                  <th className="border border-gray-300 p-3 text-right">Tiền tháng</th>
                </tr>
              </thead>
              <tbody>
                {chiTiet?.chiTietTheoThang?.map((thang, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold">
                      {thang.thang}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      Ngày {thang.ngayTrongThang}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        thang.heSoThang === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {thang.heSoThang === 1 ? '1.0 (đủ tháng)' : '0.5 (nửa tháng)'}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-3 text-right text-sm text-gray-600">
                      {thang.tinhToan}
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">
                      {thang.tienThang?.toLocaleString('vi-VN')} VNĐ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quy tắc tính tiền */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            📝 Quy tắc tính tiền
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Ngày &lt; 15:</strong> Hệ số = 1.0 (tính đủ tháng)</li>
            <li>• <strong>Ngày ≥ 15:</strong> Hệ số = 0.5 (tính nửa tháng)</li>
            <li>• <strong>Tháng tiếp theo:</strong> Luôn bắt đầu từ ngày 1 (hệ số 1.0)</li>
            <li>• <strong>1 Quý:</strong> Bằng tổng hệ số của 3 tháng</li>
          </ul>
        </div>

        {/* Tổng kết */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-green-800">
              💵 Tổng tiền cần thanh toán
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {soTien?.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>

        {/* Nút đóng */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomFeeCalculationModal;
