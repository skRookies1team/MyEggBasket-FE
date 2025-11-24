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
    const PUBLIC_KEY = process.env.PUBLIC_DATA_KEY || process.env.PUBLIC_API_KEY;
    if (!PUBLIC_KEY) return res.status(500).json({ error: 'Missing public data API key. Set PUBLIC_DATA_KEY in server env.' });

    const corpRegNo = req.query.corp_reg_no || req.query.corpNo || req.query.corp || null;
    const yearsCount = Number(req.query.yearsCount || 3);
    const currentYear = Number(req.query.bsns_year) || new Date().getFullYear();

    if (!corpRegNo) return res.status(400).json({ error: 'corp_reg_no (법인등록번호) query param is required' });

    const base = 'https://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2';

    const revenue = [];
    const profit = [];

    // 요청을 년도별로 순회하여 주요 항목을 추출
    for (let i = 0; i < yearsCount; i++) {
      const year = currentYear - i;
      const url = `${base}/getFinaStatInfo?ServiceKey=${encodeURIComponent(PUBLIC_KEY)}&corp_reg_no=${encodeURIComponent(String(corpRegNo))}&bsns_year=${year}&_type=json&numOfRows=100&pageNo=1`;
      try {
        const r = await fetch(url);
        if (!r.ok) {
          console.warn(`Public API ${year} request failed:`, r.status);
          continue;
        }
        const json = await r.json();
        // 응답 구조: response.body.items.item (단일 또는 배열)
        const items = json?.response?.body?.items?.item;
        if (!items) continue;
        const rows = Array.isArray(items) ? items : [items];

        // 항목명(account_nm 등)에서 '매출' '영업' '총자산' 키워드로 값 추출
        let revVal = null;
        let opVal = null;

        for (const it of rows) {
          const name = String(it?.account_nm || it?.accountName || '').toLowerCase();
          // 값 필드명은 API에 따라 다를 수 있음: account_amt, amount, thsuhld 등
          const rawVal = it?.account_amt ?? it?.amount ?? it?.thstrm_amount ?? it?.thstrm_amount_ex;
          const num = rawVal ? Number(String(rawVal).replace(/[,\s]/g, '')) : NaN;
          if (name.includes('매출') && Number.isFinite(num)) {
            revVal = num;
          }
          if ((name.includes('영업') || name.includes('영업이익')) && Number.isFinite(num)) {
            opVal = num;
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
