import { useState, useRef, useEffect } from "react";
import type { IndicatorState } from "../../../types/indicator";
import "../../../assets/Stock/IndicatorToggle.css";

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
    <div className="indicator-toggle" ref={ref}>
      <button
        className="indicator-button"
        onClick={() => setOpen((v) => !v)}
      >
        ⚙ 보조지표
      </button>

      {open && (
        <div className="indicator-popover">
          <label>
            <input
              type="checkbox"
              checked={indicators.ma}
              onChange={() => toggle("ma")}
            />
            MA
          </label>

          <label>
            <input
              type="checkbox"
              checked={indicators.bollinger}
              onChange={() => toggle("bollinger")}
            />
            Bollinger
          </label>

          <label>
            <input
              type="checkbox"
              checked={indicators.rsi}
              onChange={() => toggle("rsi")}
            />
            RSI
          </label>

          <label>
            <input
              type="checkbox"
              checked={indicators.macd}
              onChange={() => toggle("macd")}
            />
            MACD
          </label>

          <label>
            <input
              type="checkbox"
              checked={indicators.stochastic}
              onChange={() => toggle("stochastic")}
            />
            Stochastic
          </label>
        </div>
      )}
    </div>
  );
}
