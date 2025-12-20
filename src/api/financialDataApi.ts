import axios from 'axios';
import { getStockInfoFromDB } from './stocksApi';

// 환경 변수에서 API 키 로드 (Vite 기준)
const DART_API_KEY = import.meta.env.VITE_DART_API_KEY;
const BASE_URL = '/dart-api'; // vite.config.ts의 프록시 설정 사용

// 재무제표 응답 타입 정의
export interface DartFinancialRecord {
  account_nm: string;      // 항목명 (매출액, 영업이익 등)
  thstrm_amount: string;   // 당기 금액
  thstrm_nm: string;       // 당기 명칭
  receipt_no: string;      // 보고서 접수번호
}

export interface DartFinancialResponse {
  status: string;
  message: string;
  list?: DartFinancialRecord[];
}

export const getCorpCode = async (stockCode: string) => {
  try {
    const res = await getStockInfoFromDB(stockCode);
    return res?.corpCode;
  }catch (error){
    console.error('종목에서 회사 고유 코드를 찾을 수 없습니다:', error);
    return null;
  } 
};

/* financialDataApi.ts */

// reprt_code 매핑 객체 추가
export const REPRT_CODES = {
  '1Q': '11013', // 1분기보고서
  '2Q': '11012', // 반기보고서
  '3Q': '11014', // 3분기보고서
  '4Q': '11011', // 사업보고서
} as const;

export type QuarterType = keyof typeof REPRT_CODES;

/**
 * @param reprtCode 분기 코드 (11013, 11012 등)
 */
export const fetchFinancialMetrics = async (stockCode: string, year: string, reprtCode: string) => {
    const corpCode = await getCorpCode(stockCode);
    if (!corpCode) return null;

    try {
        const response = await axios.get<DartFinancialResponse>(`${BASE_URL}/fnlttSinglAcnt.json`, {
            params: {
                crtfc_key: DART_API_KEY,
                corp_code: corpCode,
                bsns_year: year,
                reprt_code: reprtCode, 
            },
        });

        // 결과가 없거나 status가 '013'(조회된 데이터가 없음)인 경우 처리
        if (response.data.status !== '000' || !response.data.list) {
            return { status: response.data.status, message: response.data.message };
        }

        const list = response.data.list;
        const findVal = (name: string) => 
            parseInt(list.find(item => item.account_nm.includes(name))?.thstrm_amount.replace(/,/g, '') || '0');

        const revenue = findVal('매출액');
        const profit = findVal('영업이익');
        const netProfit = findVal('당기순이익');
        const totalLiabilities = findVal('부채총계');
        const totalEquity = findVal('자본총계');
        const debtRatio = totalEquity !== 0 ? (totalLiabilities / totalEquity) * 100 : 0;
        
        const reportLink = list[0]?.receipt_no 
            ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${list[0].receipt_no}` 
            : '';

        return { year, revenue, profit, netProfit, totalLiabilities, totalEquity, debtRatio, reportLink, status: '000' };
    } catch (error) {
        console.error('DART Financial Fetch Error:', error);
        return null;
    }
};