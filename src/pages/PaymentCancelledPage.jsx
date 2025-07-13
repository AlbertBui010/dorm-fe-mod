import React from 'react';

const PaymentCancelledPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <img src="/logo/logo-stu.png" alt="STU Logo" style={{ width: 80, height: 80, marginBottom: 24 }} />
    <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>Thanh toán đã bị huỷ</h1>
    <p style={{ marginBottom: 16 }}>Bạn đã huỷ giao dịch hoặc có lỗi xảy ra trong quá trình thanh toán.</p>
    <a href="/student/payments" style={{ textDecoration: 'underline' }}>Thử lại thanh toán</a>
  </div>
);

export default PaymentCancelledPage;
