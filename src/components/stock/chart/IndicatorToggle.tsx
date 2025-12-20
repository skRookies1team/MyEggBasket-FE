import { useState, useRef, useEffect } from "react";
import type { IndicatorState } from "../../../types/indicator";

interface Props {
  indicators: IndicatorState;
  onChange: (next: IndicatorState) => void;
}

export function IndicatorToggle({ indicators, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(key: keyof IndicatorState) {
    onChange({
      ...indicators,
      [key]: !indicators[key],
    });
  }

  return (
    <div ref={ref} className="relative">
      {/* ===================== */}
      {/* Toggle Button */}
      {/* ===================== */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-1
          rounded-md bg-[#0f0f17]
          px-3 py-1.5 text-sm
          text-gray-300
          transition
          hover:bg-white/5 hover:text-gray-100
        "
      >
        <span className="text-indigo-400">⚙</span>
        보조지표
      </button>

      {/* ===================== */}
      {/* Popover */}
      {/* ===================== */}
      {open && (
        <div
          className="
            absolute right-0 top-full z-30 mt-2 w-44
            rounded-xl border border-[#232332]
            bg-[#0f0f17] p-3 shadow-lg
          "
        >
          <IndicatorItem
            label="MA"
            checked={indicators.ma}
            onChange={() => toggle("ma")}
          />
          <IndicatorItem
            label="Bollinger"
            checked={indicators.bollinger}
            onChange={() => toggle("bollinger")}
          />
          <IndicatorItem
            label="RSI"
            checked={indicators.rsi}
            onChange={() => toggle("rsi")}
          />
          <IndicatorItem
            label="MACD"
            checked={indicators.macd}
            onChange={() => toggle("macd")}
          />
          <IndicatorItem
            label="Stochastic"
            checked={indicators.stochastic}
            onChange={() => toggle("stochastic")}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Indicator Item */
/* ------------------------------------------------------------------ */
function IndicatorItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="
        flex cursor-pointer items-center justify-between
        rounded-md px-2 py-1.5
        text-sm text-gray-300
        hover:bg-white/5
      "
    >
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="
          h-4 w-4
          accent-indigo-500
          cursor-pointer
        "
      />
    </label>
  );
}
