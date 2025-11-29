import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Node 18+ has fetch; if not available, require('node-fetch') can be used.
// Keep using global fetch so no extra dependency required in modern Node.

dotenv.config();

const REST_BASE_URL = 'https://openapi.koreainvestment.com:9443';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.post('/api/approval', async (req, res) => {
  try {
    const appkey = process.env.VITE_APP_KEY || process.env.APP_KEY;
    const secret = process.env.VITE_APP_SECRET || process.env.APP_SECRET;

    if (!appkey || !secret) {
      return res.status(500).json({ error: 'Missing server-side credentials' });
    }

    const url = `${REST_BASE_URL}/oauth2/Approval`;
    const payload = {
      grant_type: 'client_credentials',
      appkey,
      secretkey: secret,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Approval request failed', detail: text });
    }

    const data = await response.json();
    return res.json({ approval_key: data.approval_key });
  } catch (err) {
    console.error('Approval proxy error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// New: 공공데이터 포털 - 기업 재무정보 요약 프록시
app.get('/api/financials', async (req, res) => {
  try {
    let PUBLIC_KEY = process.env.PUBLIC_DATA_KEY || process.env.PUBLIC_API_KEY;
    if (!PUBLIC_KEY) return res.status(500).json({ error: 'Missing public data API key. Set PUBLIC_DATA_KEY in server env.' });

    const corpRegNo = req.query.corp_reg_no || req.query.corpNo || req.query.corp || req.query.cmo || null;
    const yearsCount = Number(req.query.yearsCount || 3);
    const currentYear = Number(req.query.bsns_year || req.query.bizYear) || new Date().getFullYear();
    const base = 'https://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2';

    if (!corpRegNo) return res.status(400).json({ error: 'corp_reg_no (법인등록번호) query param is required' });

    const revenue = [];
    const profit = [];

    // helper: 호출 시 제공된 key로 먼저 시도, 실패 시 decodeURIComponent(key)로 재시도
    const fetchJsonWithKey = async (path, params, key) => {
      const qs = new URLSearchParams(params).toString();
      const url = `${base}/${path}?${qs}&serviceKey=${encodeURIComponent(key)}`;
      const r = await fetch(url);
      return r;
    };

    // 년도별로 getSummFinaStat_V2 호출 (요약재무제표)
    for (let i = 0; i < yearsCount; i++) {
      const year = currentYear - i;
      const params = {
        numOfRows: '100',
        pageNo: '1',
        resultType: 'json',
        cmo: String(corpRegNo), // optional per API 문서
        bizYear: String(year),
      };

      try {
        // 1) 시도: 환경변수에 들어있는 키를 그대로 사용
        let r = await fetchJsonWithKey('getSummFinaStat_V2', params, PUBLIC_KEY);
        // 2) 콘텐츠 타입 검사
        let contentType = String(r.headers.get('content-type') || '').toLowerCase();
        if (!contentType.includes('application/json')) {
          // 만약 원본 키가 인코딩되어 있다면 디코딩된 키로 재시도
          try {
            const decoded = decodeURIComponent(PUBLIC_KEY);
            if (decoded !== PUBLIC_KEY) {
              r = await fetchJsonWithKey('getSummFinaStat_V2', params, decoded);
              contentType = String(r.headers.get('content-type') || '').toLowerCase();
              if (contentType.includes('application/json')) {
                PUBLIC_KEY = decoded; // 앞으로는 디코딩된 키 사용
              }
            }
          } catch (e) {
            // decoding failed, continue to handle response below
          }
        }

        if (!r.ok) {
          const txt = await r.text();
          console.warn(`Public API ${year} request failed:`, r.status, txt.slice ? txt.slice(0, 500) : txt);
          continue;
        }

        if (!String(r.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
          const text = await r.text();
          console.warn(`Public API ${year} returned non-JSON content-type. Body snippet:`, (text || '').slice(0, 1000));
          return res.status(502).json({ error: 'Upstream returned non-JSON response', year, status: r.status, bodySnippet: (text || '').slice(0, 1000) });
        }

        const json = await r.json();
        const items = json?.response?.body?.items?.item;
        if (!items) {
          console.warn(`Public API ${year} returned no items. Raw body:`, JSON.stringify(json?.response?.body || {}, null, 2));
          continue;
        }

        const rows = Array.isArray(items) ? items : [items];

        // 사용자가 제공한 샘플 필드에 기반한 명시적 매핑
        // enpSaleAmt -> 매출, enpBzopPft -> 영업이익
        let revVal = null;
        let opVal = null;
        for (const it of rows) {
          // API 응답 필드명을 정확히 사용합니다.
          const rawSale = it?.enpSaleAmt;
          const rawOp = it?.enpBzopPft;

          const parseNum = (v) => {
            if (v === undefined || v === null) return NaN;
            const s = String(v).replace(/[,\s]/g, '');
            const n = Number(s);
            return Number.isFinite(n) ? n : NaN;
          };

          const saleNum = parseNum(rawSale);
          const opNum = parseNum(rawOp);

          if (Number.isFinite(saleNum)) revVal = saleNum;
          if (Number.isFinite(opNum)) opVal = opNum;

          // 디버그: 값 채취가 성공하면 로그에 표시(개발 시만)
          if (Number.isFinite(saleNum) || Number.isFinite(opNum)) {
            console.debug(`Public API ${year} row parsed: bizYear=${it?.bizYear || year}, sale=${saleNum}, op=${opNum}`);
          }
        }

        // 매핑 실패 시 rows 샘플 로그
        if ((revVal === null || opVal === null) && Array.isArray(rows) && rows.length > 0) {
          try {
            console.debug(`Public API ${year} mapping missing. rows sample:`, JSON.stringify(rows.slice(0, 20), null, 2));
          } catch (e) {
            console.debug(`Public API ${year} mapping missing. (Unable to stringify rows)`);
          }
        }

        revenue.push({ year: String(year), value: revVal ?? 0 });
        profit.push({ year: String(year), value: opVal ?? 0 });
      } catch (err) {
        console.error('Public API fetch error for year', year, err);
      }
    }

    return res.json({ revenue, profit });
  } catch (err) {
    console.error('Financials proxy error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

// 🔥 실전투자 잔고 조회 프록시
app.get('/api/account/balance', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const appkey = process.env.VITE_APP_KEY || process.env.APP_KEY;
    const appsecret = process.env.VITE_APP_SECRET || process.env.APP_SECRET;
    const CANO = process.env.CANO;
    const ACNT = process.env.ACNT_PRDT_CD || '01';

    if (!token) return res.status(400).json({ error: "Missing access token" });

    const query = new URLSearchParams({
      CANO,
      ACNT_PRDT_CD: ACNT,
      AFHR_FLPR_YN: 'N',
      OFL_YN: '',
      INQR_DVSN: '02',
      UNPR_DVSN: '01',
      FUND_STTL_ICLD_YN: 'N',
      FNCG_AMT_AUTO_RDPT_YN: 'N',
      PRCS_DVSN: '00',
      CTX_AREA_FK100: '',
      CTX_AREA_NK100: '',
    }).toString();

    const url = `${REST_BASE_URL}/uapi/domestic-stock/v1/trading/inquire-balance?${query}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
        appkey,
        appsecret,
        tr_id: 'TTTC8434R',   // 실전투자 TR
        custtype: 'P',
      }
    });

    const json = await response.json();
    return res.json(json);

  } catch (err) {
    console.error("잔고조회 프록시 에러:", err);
    return res.status(500).json({ error: "서버 내부 오류" });
  }
});

