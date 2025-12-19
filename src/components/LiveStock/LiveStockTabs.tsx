import { Stack, Button } from "@mui/material";

interface Props {
  selected: "volume" | "amount" | "rise" | "fall";
  onChange: (v: "volume" | "amount" | "rise" | "fall") => void;
}

export default function LiveStockTabs({ selected, onChange }: Props) {
  const tabs = [
    { id: "volume", label: "거래량" },
    { id: "amount", label: "거래대금" },
    { id: "rise", label: "급상승" },
    { id: "fall", label: "급하락" },
  ] as const;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        mb: 2,
        p: 0.5,
        bgcolor: "#0f0f15",
        borderRadius: 2,
        border: "1px solid #2a2a35",
      }}
    >
      {tabs.map((tab) => {
        const active = selected === tab.id;

        return (
          <Button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            variant={active ? "contained" : "text"}
            sx={{
              minWidth: 72,
              px: 2,
              py: 0.8,
              fontSize: "0.85rem",
              fontWeight: 600,

              /* 🔥 레이블 흰색 */
              color: "#ffffff",

              /* 선택된 탭 */
              ...(active && {
                bgcolor: "#7c3aed",
                "&:hover": {
                  bgcolor: "#6d28d9",
                },
              }),

              /* 선택 안 된 탭 */
              ...(!active && {
                bgcolor: "transparent",
                opacity: 0.85,
                "&:hover": {
                  bgcolor: "#232332",
                  opacity: 1,
                },
              }),
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Stack>
  );
}
