import { useState } from 'react';

interface AddPortfolioModalProps {
    onClose: () => void;
    onAdd: (type: 'risk' | 'neutral' | 'safe') => void;
}

export function AddPortfolioModal({ onClose, onAdd }: AddPortfolioModalProps) {
    const [selectedType, setSelectedType] = useState<'risk' | 'neutral' | 'safe'>('neutral');

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>새 포트폴리오 추가</h2>

                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '14px', color: '#49454f', marginBottom: '12px' }}>투자 성향을 선택하세요</p>

                    {(['risk', 'neutral', 'safe'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`type-btn ${selectedType === type ? 'selected' : ''}`}
                            style={{ borderColor: selectedType === type ? (type === 'risk' ? '#ff383c' : type === 'neutral' ? '#4f378a' : '#00b050') : '#e8e8e8' }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, color: '#1e1e1e' }}>
                                    {type === 'risk' ? '고수익 위험형' : type === 'neutral' ? '중립형' : '저수익 안전형'}
                                </p>
                                <p style={{ fontSize: '13px', color: '#49454f', marginTop: '4px' }}>
                                    {type === 'risk' ? '높은 수익률, 높은 변동성' : type === 'neutral' ? '균형잡힌 수익과 안정성' : '안정적인 배당, 낮은 변동성'}
                                </p>
                            </div>
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '50%', border: '2px solid',
                                borderColor: selectedType === type ? (type === 'risk' ? '#ff383c' : type === 'neutral' ? '#4f378a' : '#00b050') : '#d9d9d9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {selectedType === type && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'currentColor', color: 'inherit' }} />}
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3edf7', color: '#49454f', cursor: 'pointer' }}>
                        취소
                    </button>
                    <button onClick={() => onAdd(selectedType)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f378a', color: 'white', cursor: 'pointer' }}>
                        추가
                    </button>
                </div>
            </div>
        </div>
    );
}