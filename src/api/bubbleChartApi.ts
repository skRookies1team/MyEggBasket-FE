// import api from "../store/axiosStore"

// export const AiBubbleChart = async () => {
//     try {
//         const res = await api.get(`ai/keywords/trending`)
//         return res.data
//     } catch (err) {
//         console.error("❌ AI chart data 불러오기 실패:", err);
//         return null;
//     }
// }

export const AiBubbleChart = () => {
    const data = {
        "periods": {
            "1_week": {
                "keywords": [
                    {
                        "name": "반도체",
                        "count": 87
                    },
                    {
                        "name": "인공지능",
                        "count": 62
                    },
                    {
                        "name": "ETF",
                        "count": 46
                    },
                    {
                        "name": "로봇",
                        "count": 46
                    },
                    {
                        "name": "환율",
                        "count": 38
                    },
                    {
                        "name": "HBM",
                        "count": 34
                    },
                    {
                        "name": "IPO",
                        "count": 20
                    },
                    {
                        "name": "배터리",
                        "count": 18
                    },
                    {
                        "name": "금리 인하",
                        "count": 16
                    },
                    {
                        "name": "자율주행",
                        "count": 15
                    }
                ],
                "categories": [
                    {
                        "name": "경제/금융",
                        "count": 306
                    },
                    {
                        "name": "IT/과학",
                        "count": 137
                    },
                    {
                        "name": "문화/라이프",
                        "count": 23
                    },
                    {
                        "name": "국제/외교",
                        "count": 18
                    },
                    {
                        "name": "정치/사회",
                        "count": 3
                    }
                ],
                "period_start": "2025-12-24",
                "period_end": "2025-12-31"
            },
            "3_months": {
                "keywords": [
                    {
                        "name": "반도체",
                        "count": 742
                    },
                    {
                        "name": "인공지능",
                        "count": 331
                    },
                    {
                        "name": "ETF",
                        "count": 239
                    },
                    {
                        "name": "환율",
                        "count": 234
                    },
                    {
                        "name": "로봇",
                        "count": 144
                    },
                    {
                        "name": "HBM",
                        "count": 122
                    },
                    {
                        "name": "하이브",
                        "count": 115
                    },
                    {
                        "name": "IPO",
                        "count": 107
                    },
                    {
                        "name": "배터리",
                        "count": 102
                    },
                    {
                        "name": "트럼프",
                        "count": 73
                    }
                ],
                "categories": [
                    {
                        "name": "경제/금융",
                        "count": 1834
                    },
                    {
                        "name": "IT/과학",
                        "count": 576
                    },
                    {
                        "name": "문화/라이프",
                        "count": 185
                    },
                    {
                        "name": "국제/외교",
                        "count": 179
                    },
                    {
                        "name": "정치/사회",
                        "count": 11
                    }
                ],
                "period_start": "2025-09-30",
                "period_end": "2025-12-31"
            }
        }
    }
    return data
}