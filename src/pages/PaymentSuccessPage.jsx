import { useSearchParams } from 'react-router-dom';
import PaymentResult from '../components/PaymentResult';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <PaymentResult
      type="success"
      title="Thanh toán thành công!"
      message="Cảm ơn bạn đã thanh toán. Giao dịch của bạn đã được xác nhận và xử lý thành công."
      orderCode={orderCode}
      autoRedirect={true}
      redirectDelay={5000}
    />
  );
};

export default PaymentSuccessPage;
