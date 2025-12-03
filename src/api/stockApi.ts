// src/api/stockApi.ts
import { REST_BASE_URL, APP_KEY, APP_SECRET, CANO, ACNT_PRDT_CD } from '../config/api';
import type { StockPriceData, CurrentPriceResult, AccountBalanceData } from '../types/stock';


/**
 * 주식 잔고 조회 (모의투자)
 * API: /uapi/domestic-stock/v1/trading/inquire-balance
 * TR_ID: TTTC8434R (실전투자) /  VTTC8434R (모의투자)
 */
export async function fetchAccountBalance(accessToken: string): Promise<AccountBalanceData | null> {
    const trId = 'TTTC8434R'; // 실전투자 잔고조회 TR ID

    // API 문서에 따른 필수 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
        CANO: CANO,                     // 계좌번호 (8자리)
        ACNT_PRDT_CD: ACNT_PRDT_CD,     // 상품코드 (2자리)
        AFHR_FLPR_YN: 'N',              // 시간외단일가여부 (N: 기본)
        OFL_YN: '',                     // 오프라인여부 (공란)
        INQR_DVSN: '02',                // 조회구분 (02: 종목별)
        UNPR_DVSN: '01',                // 단가구분 (01: 기본값)
        FUND_STTL_ICLD_YN: 'N',         // 펀드결제분포함여부 (N)
        FNCG_AMT_AUTO_RDPT_YN: 'N',     // 융자금액자동상환여부 (N)
        PRCS_DVSN: '00',                // 처리구분 (00: 전일매매포함)
        CTX_AREA_FK100: '',             // 연속조회검색조건 (첫 조회시 공란)
        CTX_AREA_NK100: '',             // 연속조회키 (첫 조회시 공란)
    });

    try {
        const response = await fetch(`${REST_BASE_URL}/uapi/domestic-stock/v1/trading/inquire-balance?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${accessToken}`,
                'appkey': APP_KEY,
                'appsecret': APP_SECRET,
                'tr_id': trId,
                'custtype': 'P', // 개인
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Balance API Error: ${response.status}`, text);
            return null;
        }

        const json = await response.json();

        if (json.rt_cd !== '0') {
            console.error(`잔고 조회 실패: ${json.msg1} (${json.msg_cd})`);
            return null;
        }

        // output1: 보유 종목 리스트
        const holdings = (json.output1 || []).map((item: any) => ({
            pdno: item.pdno,
            prdt_name: item.prdt_name,
            hldg_qty: Number(item.hldg_qty),
            ord_psbl_qty: Number(item.ord_psbl_qty),
            pchs_avg_pric: Number(item.pchs_avg_pric),
            prpr: Number(item.prpr),
            evlu_amt: Number(item.evlu_amt),
            evlu_pfls_amt: Number(item.evlu_pfls_amt),
            evlu_pfls_rt: Number(item.evlu_pfls_rt),
        }));

        // output2: 계좌 요약 (배열로 오지만 보통 1개만 옴)
        const summaryRaw = json.output2?.[0] || {};
        const summary = {
            dnca_tot_amt: Number(summaryRaw.dnca_tot_amt),
            nxdy_excc_amt: Number(summaryRaw.nxdy_excc_amt),
            prvs_rcdl_excc_amt: Number(summaryRaw.prvs_rcdl_excc_amt),
            scts_evlu_amt: Number(summaryRaw.scts_evlu_amt),
            tot_evlu_amt: Number(summaryRaw.tot_evlu_amt),
            nass_amt: Number(summaryRaw.nass_amt),
            asst_icdc_amt: Number(summaryRaw.asst_icdc_amt),
            tot_loan_amt: Number(summaryRaw.tot_loan_amt),
            evlu_pfls_smtl_amt: Number(summaryRaw.evlu_pfls_smtl_amt),
        };

        return { holdings, summary };

    } catch (error) {
        console.error('잔고 조회 중 오류:', error);
        return null;
    }
}

/**
 * 주문 (매수/매도)
 * @param accessToken 토큰
 * @param type 'buy'(매수) | 'sell'(매도)
 * @param price 주문 단가 (0이면 시장가)
 * @param quantity 주문 수량
 */
export async function placeOrder(
    stockCode: string,
    accessToken: string,
    type: 'buy' | 'sell',
    price: number,
    quantity: number
): Promise<{ success: boolean; msg: string }> {
    // 1. 실전투자용 TR ID 설정
    // 매도: TTTC0011U, 매수: TTTC0012U
    const trId = type === 'buy' ? 'TTTC0012U' : 'TTTC0011U';

    // 2. 주문 구분 (00: 지정가, 01: 시장가)
    const orderDivision = price === 0 ? '01' : '00';

    // API 요구사항: 수량/가격은 문자열이어야 함
    const requestBody = {
        CANO: CANO,                 // 종합계좌번호
        ACNT_PRDT_CD: ACNT_PRDT_CD, // 계좌상품코드
        PDNO: stockCode,           // 종목코드
        ORD_DVSN: orderDivision,    // 주문구분
        ORD_QTY: String(quantity),  // 주문수량
        ORD_UNPR: String(price),    // 주문단가 (시장가일 경우 0)
    };

    try {
        const response = await fetch(`${REST_BASE_URL}/uapi/domestic-stock/v1/trading/order-cash`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${accessToken}`,
                'appkey': APP_KEY,
                'appsecret': APP_SECRET,
                'tr_id': trId,
                'custtype': 'P',
            },
            body: JSON.stringify(requestBody),
        });

        const json = await response.json();

        if (json.rt_cd === '0') {
            // 성공
            return { success: true, msg: `주문 성공! (주문번호: ${json.output?.ODNO})` };
        } else {
            // 실패
            return { success: false, msg: `주문 실패: ${json.msg1} (${json.msg_cd})` };
        }

    } catch (error) {
        console.error('주문 API 에러:', error);
        return { success: false, msg: '시스템 오류가 발생했습니다.' };
    }
}

/**
 * 접근 토큰(Access Token) 발급 (localStorage 캐싱 적용)
 */
export async function getAccessToken(): Promise<string> {
    const cachedToken = localStorage.getItem('kis_access_token');
    const cachedExpire = localStorage.getItem('kis_token_expire');

    if (cachedToken && cachedExpire && Date.now() < Number(cachedExpire)) {
        return cachedToken;
    }

    console.log('🔄 KIS 토큰 새로 발급');

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

        const data = await response.json();
        const token = data.access_token;

        const expiresIn = 20 * 60 * 60 * 1000;
        localStorage.setItem('kis_access_token', token);
        localStorage.setItem('kis_token_expire', String(Date.now() + expiresIn));

        console.log("✅ 토큰 발급 완료");
        return token;

    } catch (err) {
        console.error("AccessToken 발급 실패:", err);
        return cachedToken ?? "";
    }
}


/* ============================================================
    🔵 4) 해외 지수 조회 API (추가된 부분)
============================================================ */
export interface IndexData {
  indexName: string;
  time: string;
  current: number;
  change: number;
  rate: number;
  volume: number;
}

export async function fetchOverseasIndex(
    code: string,
    name: string
): Promise<IndexData | null> {
    try {
        const token = await getAccessToken();  // 🔥 공통 토큰 사용

        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: "N",
            FID_INPUT_ISCD: code,
            FID_HOUR_CLS_CODE: "0",
            FID_PW_DATA_INCU_YN: "N",
        });

        const response = await fetch(
            `${REST_BASE_URL}/uapi/overseas-price/v1/quotations/inquire-time-indexchartprice?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "content-type": "application/json; charset=utf-8",
                    authorization: `Bearer ${token}`,
                    appkey: APP_KEY,
                    appsecret: APP_SECRET,
                    tr_id: "FHKST03030200",
                },
            }
        );

        const json = await response.json();
        if (json.rt_cd !== "0") return null;

        const o = json.output1;

        return {
            indexName: name,
            time: "API",
            current: Number(o.ovrs_nmix_prpr),
            change: Number(o.ovrs_nmix_prdy_vrss),
            rate: Number(o.prdy_ctrt),
            volume: 0,
        };

    } catch (err) {
        console.error("해외지수 조회 오류:", err);
        return null;
    }
}

// 해외 주요 지수 단축 호출
export const fetchSP500 = () => fetchOverseasIndex("SPX", "S&P500");
export const fetchNasdaq100 = () => fetchOverseasIndex("NDX", "NASDAQ100");
export const fetchDowJones = () => fetchOverseasIndex("DOW", "DOWJONES");
export const fetchWTI = () => fetchOverseasIndex("CL", "WTI");

/* ============================================================
    🔵 5) 국내 일/주/월/년 시세 조회
============================================================ */
function formatApiDate(dateStr: string) {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

export interface IndexData {
  indexName: string;
  time: string;
  current: number;
  change: number;
  rate: number;
  volume: number;
}


export async function fetchHistoricalData(
    stockCode: string,
    period: 'day' | 'week' | 'month' | 'year',
    accessToken: string
): Promise<StockPriceData[]> {

    const periodMap: Record<string, string> = {
        day: 'D',
        week: 'W',
        month: 'M',
        year: 'Y',
    };

    const today = new Date();
    const endDate = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const startDateObj = new Date();
    if (period === 'day') startDateObj.setMonth(today.getMonth() - 6);
    else if (period === 'week') startDateObj.setFullYear(today.getFullYear() - 2);
    else startDateObj.setFullYear(today.getFullYear() - 5);

    const startDate = startDateObj.toISOString().slice(0, 10).replace(/-/g, '');

    const queryParams = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: stockCode,
        FID_INPUT_DATE_1: startDate,
        FID_INPUT_DATE_2: endDate,
        FID_PERIOD_DIV_CODE: periodMap[period],
        FID_ORG_ADJ_PRC: '1',
    });

    try {
        const response = await fetch(
            `${REST_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${queryParams}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                    appkey: APP_KEY,
                    appsecret: APP_SECRET,
                    tr_id: 'FHKST03010100',
                    custtype: 'P',
                },
            }
        );

        const json = await response.json();
        const items = json.output2 || [];

        return items.reverse().map((item: any) => ({
            time: formatApiDate(item.stck_bsop_date),
            price: Number(item.stck_clpr),
            volume: Number(item.acml_vol),
        }));
    } catch (err) {
        console.error("기간 데이터 조회 오류:", err);
        return [];
    }
}

/**
 * 주식 현재가 시세 조회 (REST API)
 * API: /uapi/domestic-stock/v1/quotations/inquire-price
 */
export async function fetchCurrentPrice(
    accessToken: string,
    stockCode: string
): Promise<CurrentPriceResult | null> {
    try {
        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_INPUT_ISCD: stockCode,
        });

        const response = await fetch(
            `${REST_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${accessToken}`,
                    appkey: APP_KEY,
                    appsecret: APP_SECRET,
                    tr_id: 'FHKST01010100',
                    custtype: 'P',
                },
            }
        );

        const json = await response.json();
        const output = json.output;
        if (!output) return null;

        return {
            stck_prpr: Number(output.stck_prpr),
            prdy_vrss: Number(output.prdy_vrss),
            prdy_ctrt: Number(output.prdy_ctrt),
            acml_vol: Number(output.acml_vol),
        };

    } catch (err) {
        console.error("현재가 조회 실패:", err);
        return null;
    }
}

/* ============================================================
    🔵 6) 국내 업종 지수 초단위 조회 (KOSPI / KOSDAQ)
       TR_ID: FHPUP02110100
       URL: /uapi/domestic-stock/v1/quotations/inquire-index-tickprice
============================================================ */

export interface IndexTickData {
    time: string;     // HHMMSS
    price: number;    // 현재 지수
    change: number;   // 전일 대비
    rate: number;     // 등락률
    volume: number;   // 누적 거래량
}

export async function fetchIndexTickPrice(
    indexCode: "0001" | "1001" | "2001" | "3003"
): Promise<IndexTickData[] | null> {

    try {
        const token = await getAccessToken();

        const params = new URLSearchParams({
            FID_INPUT_ISCD: indexCode,
            FID_COND_MRKT_DIV_CODE: "U", // 업종/지수
        });

        const response = await fetch(
            `${REST_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-index-tickprice?${params}`,
            {
                method: "GET",
                headers: {
                    "content-type": "application/json; charset=utf-8",
                    authorization: `Bearer ${token}`,
                    appkey: APP_KEY,
                    appsecret: APP_SECRET,
                    tr_id: "FHPUP02110100",
                    custtype: "P",
                },
            }
        );

        // HTTP 오류 확인
        if (!response.ok) {
            const text = await response.text();
            console.error("❌ 업종 지수 API HTTP Error:", response.status, text);
            return null;
        }

        const raw = await response.text();

        if (!raw || raw.trim() === "") {
            console.error("❌ 업종 지수 API: 응답 body 없음");
            return null;
        }

        let json;
        try {
            json = JSON.parse(raw);
        } catch (err) {
            console.error("❌ JSON 파싱 실패, 응답 원본:", raw);
            return null;
        }

        if (json.rt_cd !== "0") {
            console.error(
                `❌ 업종 지수 조회 실패: ${json.msg1} (${json.msg_cd})`
            );
            return null;
        }

        const items = json.output || [];

        // 변환 → React에서 쓰기 쉽게 숫자 형태로
        return items.map((item: any) => ({
            time: item.stck_cntg_hour,
            price: Number(item.bstp_nmix_prpr),
            change: Number(item.bstp_nmix_prdy_vrss),
            rate: Number(item.bstp_nmix_prdy_ctrt),
            volume: Number(item.acml_vol),
        }));
    } catch (err) {
        console.error("❌ 업종 지수 API 오류:", err);
        return null;
    }
}
