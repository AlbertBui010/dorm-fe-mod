import { useSearchParams } from 'react-router-dom';
import PaymentResult from '../components/PaymentResult';

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const error = searchParams.get('error');

  return (
    <PaymentResult
      type="error"
      title="Thanh toán thất bại"
      message={
        error 
          ? `Giao dịch thất bại: ${error}. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.`
          : "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ."
      }
      orderCode={orderCode}
      autoRedirect={false}
    />
  );
};

export default PaymentFailedPage;
