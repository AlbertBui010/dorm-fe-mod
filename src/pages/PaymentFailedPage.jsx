import React from 'react';

const PaymentFailedPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <img src="/logo/logo-stu.png" alt="STU Logo" style={{ width: 80, height: 80, marginBottom: 24 }} />
    <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>Thanh toán thất bại</h1>
    <p style={{ marginBottom: 16 }}>Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
    <a href="/student/payments" style={{ textDecoration: 'underline' }}>Quay lại trang thanh toán</a>
  </div>
);

export default PaymentFailedPage;
