export type ModalType = 'success' | 'error' | null;

interface LoginModalProps {
  type: ModalType;
  message: string;
  onClose: () => void;
  actionLabel?: string; // 추가: 버튼에 표시할 텍스트
  onAction?: () => void; // 추가: 버튼 클릭 시 실행할 함수
}

export type { LoginModalProps };