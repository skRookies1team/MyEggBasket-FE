import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const tickerScroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

interface MarketIndex {
  name: string;
  value: string;
  percent: string;
  isUp: boolean;
}

interface Props {
  indices: MarketIndex[];
}

export default function MarketIndexTicker({ indices }: Props) {
  if (!indices || indices.length === 0) return null;

  const data = [...indices, ...indices];

  return (
    <Box
      sx={{
        position: "fixed",
        top: "64px",
        left: 0,
        width: "100%",
        zIndex: 1100,
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: "#16161e",
        borderBottom: "1px solid #2a2a35",
        py: 1.2,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          gap: 6,
          minWidth: "200%",
          animation: `${tickerScroll} 25s linear infinite`,
          "&:hover": { animationPlayState: "paused" },
        }}
      >
        {data.map((item, i) => {
          const color = item.isUp ? "#ff4d6a" : "#3ca8ff";

          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: "max-content",
              }}
            >
              {/* 지수명 */}
              <Typography sx={{ fontWeight: 700, color: "#ffffff", fontSize: "0.85rem" }}>
                {item.name}
              </Typography>

              {/* 현재가 */}
              <Typography sx={{ color: "#ffffff", fontSize: "0.85rem", opacity: 0.9 }}>
                {item.value}
              </Typography>

              {/*상승 / 하락 아이콘 + 퍼센트 */}
              <Box sx={{ display: "flex", alignItems: "center", color }}>
                {item.isUp ? (
                  <ArrowDropUpIcon sx={{ fontSize: 20, mt: "-2px" }} />
                ) : (
                  <ArrowDropDownIcon sx={{ fontSize: 20, mt: "-2px" }} />
                )}

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color,
                  }}
                >
                  {item.percent}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
