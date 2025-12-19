import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

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
  const data = [...indices, ...indices];

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: "#16161e",
        borderBottom: "1px solid #2a2a35",
        py: 1.2,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          gap: 6,
          animation: `${tickerScroll} 25s linear infinite`,
          "&:hover": { animationPlayState: "paused" },
        }}
      >
        {data.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontWeight: 700, color: "#ffffff", fontSize: "0.85rem" }}>
              {item.name}
            </Typography>
            <Typography sx={{ color: "#ffffff", fontSize: "0.85rem", opacity: 0.9 }}>
              {item.value}
            </Typography>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: item.isUp ? "#00e676" : "#ff4d6a",
              }}
            >
              {item.percent}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}