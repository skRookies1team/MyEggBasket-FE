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

/**
 * 기업의 주요 재무지표(매출, 이익, 부채 등)를 가져옵니다.
 * @param stockCode 종목코드 (6자리)
 * @param year 결산년도
 */
export const fetchFinancialMetrics = async (stockCode: string, year:string) => {
    const corpCode = await getCorpCode(stockCode);
    if (!corpCode) return null;
    console.log(corpCode)
  try {
    const response = await axios.get<DartFinancialResponse>(`${BASE_URL}/fnlttSinglAcnt.json`, {
      params: {
        crtfc_key: DART_API_KEY,
        corp_code: corpCode,
        bsns_year: year,
        reprt_code: "11011", // 사업보고서(결산) 기준
      },
    });

    if (response.data.status === '000' && response.data.list) {
      const list = response.data.list;
      
      // 필요한 데이터만 추출
      const findVal = (name: string) => 
        parseInt(list.find(item => item.account_nm.includes(name))?.thstrm_amount.replace(/,/g, '') || '0');

      const revenue = findVal('매출액');
      const profit = findVal('영업이익');
      const netProfit = findVal('당기순이익');
      const totalLiabilities = findVal('부채총계');
      const totalEquity = findVal('자본총계');

      // 부채비율 계산 (부채총계 / 자본총계 * 100)
      const debtRatio = totalEquity !== 0 ? (totalLiabilities / totalEquity) * 100 : 0;
      
      // 첫 번째 항목의 접수번호를 사용해 보고서 링크 생성 가능
      const reportLink = list[0]?.receipt_no 
        ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${list[0].receipt_no}` 
        : '';

      return {
        year,
        revenue,
        profit,
        netProfit,
        debtRatio,
        reportLink
      };
    }
    return null;
  } catch (error) {
    console.error('DART Financial Fetch Error:', error);
    return null;
  }
};