import { useSearchParams } from 'react-router-dom';
import PaymentResult from '../components/PaymentResult';

const PaymentCancelledPage = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <PaymentResult
      type="warning"
      title="Thanh toán đã bị hủy"
      message="Bạn đã hủy giao dịch hoặc có lỗi xảy ra trong quá trình thanh toán. Trạng thái thanh toán đã được cập nhật và bạn có thể thử thanh toán lại."
      orderCode={orderCode}
      autoRedirect={true}
      redirectDelay={5000}
    />
  );
};

export default PaymentCancelledPage;
