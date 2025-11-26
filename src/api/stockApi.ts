// src/api/stockApi.ts
import { REST_BASE_URL, APP_KEY, APP_SECRET, STOCK_CODE } from '../config/api';
import type { StockPriceData } from '../types/stock';

/**
 * 접근 토큰(Access Token) 발급 (localStorage 캐싱 적용)
 */
export async function getAccessToken(): Promise<string> {
    // 1. 캐시된 토큰 확인
    const cachedToken = localStorage.getItem('kis_access_token');
    const cachedExpire = localStorage.getItem('kis_token_expire');

    // 토큰이 있고, 유효기간(약 24시간)이 아직 안 지났으면 재사용
    if (cachedToken && cachedExpire && Date.now() < Number(cachedExpire)) {
        console.log('✅ 캐시된 토큰을 사용합니다.');
        return cachedToken;
    }

    // 2. 토큰이 없거나 만료됐으면 새로 요청
    console.log('🔄 새 접근 토큰을 요청합니다...');

    try {
        const response = await fetch(`${REST_BASE_URL}/oauth2/tokenP`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                appkey: APP_KEY,
                appsecret: APP_SECRET,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            // 1분 제한에 걸렸을 경우, 기존에 혹시 저장된게 있다면 그거라도 반환 시도 (선택적)
            if (errorText.includes('EGW00133') && cachedToken) {
                console.warn('⚠️ 1분 제한 걸림: 기존 캐시 토큰 임시 사용');
                return cachedToken;
            }
            throw new Error(`Token Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const token = data.access_token;

        // 3. 토큰 저장 (유효기간: 발급 시점 + 20시간 정도로 넉넉하게 잡음)
        // 실제 유효기간은 24시간이지만 안전하게 20시간으로 설정
        const expiresIn = 20 * 60 * 60 * 1000;
        localStorage.setItem('kis_access_token', token);
        localStorage.setItem('kis_token_expire', String(Date.now() + expiresIn));

        console.log('✅ 토큰 발급 및 저장 완료');
        return token;

    } catch (error) {
        console.error('AccessToken 발급 실패:', error);
        // 에러나도 기존 캐시가 있으면 일단 반환해보기
        if (cachedToken) return cachedToken;
        return '';
    }
}

/**
 * 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
 */
function formatApiDate(dateStr: string) {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

/**
 * 기간별 시세 조회 (일/주/월/년)
 */
export async function fetchHistoricalData(
    period: 'day' | 'week' | 'month' | 'year',
    accessToken: string
): Promise<StockPriceData[]> {
    // 1. 기간 코드 매핑
    const periodMap: Record<string, string> = {
        day: 'D',
        week: 'W',
        month: 'M',
        year: 'Y',
    };

    // 2. 조회 기간 계산
    const today = new Date();
    const endDate = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    const startDateObj = new Date();
    if (period === 'day') startDateObj.setMonth(today.getMonth() - 6);
    else if (period === 'week') startDateObj.setFullYear(today.getFullYear() - 2);
    else startDateObj.setFullYear(today.getFullYear() - 5);

    const startDate = startDateObj.toISOString().slice(0, 10).replace(/-/g, '');

    // 3. 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: STOCK_CODE,
        FID_INPUT_DATE_1: startDate,
        FID_INPUT_DATE_2: endDate,
        FID_PERIOD_DIV_CODE: periodMap[period],
        FID_ORG_ADJ_PRC: '1',
    });

    try {
        const url = `${REST_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${accessToken}`,
                'appkey': APP_KEY,
                'appsecret': APP_SECRET,
                'tr_id': 'FHKST03010100',
                'custtype': 'P',
            },
        });

        if (!response.ok) {
            console.error(`API Error Status: ${response.status}`);
            return [];
        }

        const json = await response.json();
        const items = json.output2 || [];

        return items.reverse().map((item: any) => ({
            time: formatApiDate(item.stck_bsop_date),
            price: Number(item.stck_clpr),
            volume: Number(item.acml_vol),
        }));

    } catch (error) {
        console.error('기간별 데이터 조회 실패:', error);
        return [];
    }
}
export interface CurrentPriceResult {
    stck_prpr: number; // 현재가
    prdy_vrss: number; // 전일대비
    prdy_ctrt: number; // 등락률
    acml_vol: number;  // 누적 거래량
}

export async function fetchCurrentPrice(accessToken: string): Promise<CurrentPriceResult | null> {
    try {
        const queryParams = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J', // J: 주식
            FID_INPUT_ISCD: STOCK_CODE,  // 종목코드
        });

        const url = `${REST_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${accessToken}`,
                'appkey': APP_KEY,
                'appsecret': APP_SECRET,
                'tr_id': 'FHKST01010100', // 주식 현재가 시세 TR ID
                'custtype': 'P',
            },
        });

        if (!response.ok) {
            console.error(`Current Price API Error: ${response.status}`);
            return null;
        }

        const json = await response.json();
        const output = json.output;

        if (!output) return null;

        return {
            stck_prpr: Number(output.stck_prpr),
            prdy_vrss: Number(output.prdy_vrss),
            prdy_ctrt: Number(output.prdy_ctrt),
            acml_vol: Number(output.acml_vol), // ★ REST로 받아온 누적 거래량
        };

    } catch (error) {
        console.error('현재가 조회 실패:', error);
        return null;
    }
}