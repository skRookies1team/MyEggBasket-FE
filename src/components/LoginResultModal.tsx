import type { LoginModalProps } from "../types/modal";

const LoginResultModal: React.FC<LoginModalProps> = ({ 
  type, message, onClose, actionLabel, onAction 
}) => {
  if (!type) return null;

  const isSuccess = type === 'success';

  // 버튼 클릭 핸들러: onAction이 있으면 실행하고, 없으면 기본 onClose 실행
  const handleButtonClick = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 bg-[#1a1a24] border border-[#2a2a35] rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'} mb-4`}>
            {isSuccess ? (
              <span className="text-green-500 text-3xl">✓</span>
            ) : (
              <span className="text-red-500 text-3xl">✕</span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {isSuccess ? '성공' : '오류'}
          </h3>
          <p className="text-gray-400 text-sm whitespace-pre-line">
            {message}
          </p>

          <button
            onClick={handleButtonClick}
            className={`mt-6 w-full py-3 px-4 rounded-xl font-bold text-white transition-all 
              ${isSuccess ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {actionLabel || '확인'} 
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginResultModal;