import { useState } from 'react';
import type { RiskLevel } from '../../types/portfolios';

interface AddPortfolioModalProps {
    onClose: () => void;
    onAdd: (data: { name: string, riskLevel: RiskLevel, totalAsset: 0, cashBalance: 0 }) => void;
}

export function AddPortfolioModal({ onClose, onAdd }: AddPortfolioModalProps) {
    const [name, setName] = useState('');
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('MODERATE');

    const handleAdd = () => {
        if (!name.trim()) {
            alert('포트폴리오 이름을 입력해주세요.');
            return;
        }
        onAdd({ name, riskLevel,totalAsset: 0, cashBalance: 0});
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>새 포트폴리오 추가</h2>

                {/* 포트폴리오 이름 입력 */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="portfolio-name" style={{ display: 'block', fontSize: '14px', color: '#49454f', marginBottom: '8px' }}>
                        포트폴리오 이름
                    </label>
                    <input
                        id="portfolio-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 나의 첫 번째 포트폴리오"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* 투자 성향 선택 */}
                <div style={{ marginBottom: '24px' }}>
                    <label htmlFor="risk-level" style={{ display: 'block', fontSize: '14px', color: '#49454f', marginBottom: '8px' }}>
                        투자 성향
                    </label>
                    <select
                        id="risk-level"
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            fontSize: '14px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="AGGRESSIVE">위험형 (고수익 추구)</option>
                        <option value="MODERATE">중립형 (균형 투자)</option>
                        <option value="CONSERVATIVE">안전형 (안정성 중시)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#f3edf7', color: '#49454f', cursor: 'pointer' }}>
                        취소
                    </button>
                    <button onClick={handleAdd} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f378a', color: 'white', cursor: 'pointer' }}>
                        추가
                    </button>
                </div>
            </div>
        </div>
    );
}