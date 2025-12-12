import api from "../store/axiosStore";

export interface VolumeRankItem {
  name: string;
  code: string;
  rank: number;
  price: number;
  change: number;
  rate: number;
  volume: number;
  prevVolume: number;
  turnover: number;
}

function toNum(v: any): number {
  if (v == null) return 0;
  return Number(String(v).replace(/,/g, ""));
}

/**
 * 📌 백엔드 응답 → VolumeRankItem[] 으로 매핑
 */
function mapVolumeRank(res: any): VolumeRankItem[] {
  const list = res.output || res || [];

  return list.map((item: any) => ({
    name: item.name ?? item.hts_kor_isnm,
    code: item.code ?? item.mksc_shrn_iscd,
    rank: Number(item.rank ?? item.data_rank),
    price: toNum(item.price ?? item.stck_prpr),
    change: toNum(item.change ?? item.prdy_vrss),
    rate: toNum(item.rate ?? item.prdy_ctrt),
    volume: toNum(item.volume ?? item.acml_vol),
    prevVolume: toNum(item.prevVolume ?? item.prdy_vol),
    turnover: toNum(item.turnover ?? item.vol_inrt),
  }));
}

/**
 * 🇰🇷 거래량 순위 TOP10 조회
 * GET /api/app/kis/rank/volume-top10
 */
export async function fetchVolumeRankTop10(): Promise<VolumeRankItem[]> {
  const res = await api.get("/kis/rank/volume-top10", {
    withCredentials: true,
  });
  return mapVolumeRank(res.data);
}
