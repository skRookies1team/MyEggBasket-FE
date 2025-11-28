// src/api/stockApi.ts
import { REST_BASE_URL, APP_KEY, APP_SECRET, STOCK_CODE, CANO, ACNT_PRDT_CD } from '../config/api';
import type { StockPriceData, CurrentPriceResult, AccountBalanceData } from '../types/stock';
import type { IndexData } from "../api/stockIndex";

/* ============================================================
    🔥 1) 한국투자증권 AccessToken 발급 + 캐싱
============================================================ */
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
    🔵 2) 잔고 조회
============================================================ */
export async function fetchAccountBalance(accessToken: string): Promise<AccountBalanceData | null> {
    const trId = 'TTTC8434R';

    const queryParams = new URLSearchParams({
        CANO,
        ACNT_PRDT_CD,
        AFHR_FLPR_YN: 'N',
        OFL_YN: '',
        INQR_DVSN: '02',
        UNPR_DVSN: '01',
        FUND_STTL_ICLD_YN: 'N',
        FNCG_AMT_AUTO_RDPT_YN: 'N',
        PRCS_DVSN: '00',
        CTX_AREA_FK100: '',
        CTX_AREA_NK100: '',
    });

    try {
        const response = await fetch(`${REST_BASE_URL}/uapi/domestic-stock/v1/trading/inquire-balance?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`,
                appkey: APP_KEY,
                appsecret: APP_SECRET,
                tr_id: trId,
                custtype: 'P',
            },
        });

        const json = await response.json();
        if (json.rt_cd !== '0') return null;

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

        const summary = json.output2?.[0] || {};

        return {
            holdings,
            summary: {
                dnca_tot_amt: Number(summary.dnca_tot_amt),
                nxdy_excc_amt: Number(summary.nxdy_excc_amt),
                prvs_rcdl_excc_amt: Number(summary.prvs_rcdl_excc_amt),
                scts_evlu_amt: Number(summary.scts_evlu_amt),
                tot_evlu_amt: Number(summary.tot_evlu_amt),
                nass_amt: Number(summary.nass_amt),
                asst_icdc_amt: Number(summary.asst_icdc_amt),
                tot_loan_amt: Number(summary.tot_loan_amt),
                evlu_pfls_smtl_amt: Number(summary.evlu_pfls_smtl_amt),
            }
        };

    } catch (error) {
        console.error('잔고 조회 오류:', error);
        return null;
    }
}

/* ============================================================
    🔵 3) 국내 주식 주문
============================================================ */
export async function placeOrder(
    accessToken: string,
    type: 'buy' | 'sell',
    price: number,
    quantity: number
) {
    const trId = type === 'buy' ? 'TTTC0012U' : 'TTTC0011U';
    const orderDivision = price === 0 ? '01' : '00';

    const body = {
        CANO,
        ACNT_PRDT_CD,
        PDNO: STOCK_CODE,
        ORD_DVSN: orderDivision,
        ORD_QTY: String(quantity),
        ORD_UNPR: String(price),
    };

    try {
        const response = await fetch(`${REST_BASE_URL}/uapi/domestic-stock/v1/trading/order-cash`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`,
                appkey: APP_KEY,
                appsecret: APP_SECRET,
                tr_id: trId,
                custtype: 'P',
            },
            body: JSON.stringify(body),
        });

        const json = await response.json();
        if (json.rt_cd === '0') {
            return { success: true, msg: `주문 성공 (번호: ${json.output?.ODNO})` };
        }

        return { success: false, msg: json.msg1 };

    } catch (err) {
        return { success: false, msg: "주문 오류" };
    }
}

/* ============================================================
    🔵 4) 해외 지수 조회 API (추가된 부분)
============================================================ */
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
export const fetchSP500 = () => fetchOverseasIndex("SPI", "S&P500");
export const fetchNasdaq100 = () => fetchOverseasIndex("NDX", "NASDAQ100");
export const fetchDowJones = () => fetchOverseasIndex("DJI", "DOWJONES");
export const fetchWTI = () => fetchOverseasIndex("CL", "WTI");

/* ============================================================
    🔵 5) 국내 일/주/월/년 시세 조회
============================================================ */
function formatApiDate(dateStr: string) {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

export async function fetchHistoricalData(
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
    const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');

    const start = new Date();
    if (period === 'day') start.setMonth(today.getMonth() - 6);
    else if (period === 'week') start.setFullYear(today.getFullYear() - 2);
    else start.setFullYear(today.getFullYear() - 5);

    const startDate = start.toISOString().slice(0, 10).replace(/-/g, '');

    const queryParams = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: STOCK_CODE,
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

/* ============================================================
    🔵 6) 현재가 조회
============================================================ */
export async function fetchCurrentPrice(accessToken: string): Promise<CurrentPriceResult | null> {
    try {
        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_INPUT_ISCD: STOCK_CODE,
        });

        const response = await fetch(
            `${REST_BASE_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`,
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
