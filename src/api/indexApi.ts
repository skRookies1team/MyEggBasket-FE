import api from "../store/axiosStore";

function toNum(v: any): number {
  if (v == null) return 0;
  return Number(String(v).replace(/,/g, ""));
}

// 🇰🇷 국내 지수 변환
function mapKoreaIndex(res: any) {
  const list = res.output;

  return {
    current: toNum(list.bstp_nmix_prpr),
    change: toNum(list.bstp_nmix_prdy_vrss),
    rate: toNum(list.bstp_nmix_prdy_ctrt),
    volume: toNum(list.acml_vol),
  };
}

// 🇺🇸 해외 지수 변환 (이미 정상 동작)
function mapForeignIndex(res: any) {
  const o = res.output1;

  return {
    current: toNum(o.ovrs_nmix_prpr),
    change: toNum(o.ovrs_nmix_prdy_vrss),
    rate: toNum(o.prdy_ctrt),
  };
}

// 🇰🇷 국내 지수 조회
export async function fetchKoreaIndex(indexCode: "0001" | "1001") {
  const res = await api.get("/kis/index/domestic", {
    params: { indexCode },
  });
  return mapKoreaIndex(res.data);
}

// 🇺🇸 해외 지수 조회
export async function fetchForeignIndex(
  indexCode: "SPX" | "NDX" | "DOW" | "CL"
) {
  const res = await api.get("/kis/index/oversea", {
    params: { indexCode },
  });
  return mapForeignIndex(res.data);
}
