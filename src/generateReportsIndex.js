import fs from "fs";
import path from "path";

/* ================================
   설정
================================ */
const REPORT_DIR = "../reports";
const OUTPUT_FILE = "../reports.json";

/* ================================
   유틸
================================ */
const nowISO = () => new Date().toISOString();

function parseFileName(file) {
  const match = file.match(
    /^(\d{6})_([^_]+)_(\d{6})_(.+)_([a-zA-Z0-9]+)\.pdf$/i
  );

  if (!match) return null;

  const stockCode = match[1];
  const company = match[2];
  const rawDate = match[3]; // YYMMDD
  const title = match[4];
  const hash = match[5];

  // YYMMDD → YYYY-MM-DD
  const year = Number(rawDate.slice(0, 2)) + 2000;
  const month = rawDate.slice(2, 4);
  const day = rawDate.slice(4, 6);

  const date = `${year}-${month}-${day}`;

  return {
    stockCode,
    company,
    date,
    title,
    file
  };
}

/* ================================
   메인 로직
================================ */
const files = fs.readdirSync(REPORT_DIR);

const stocks = {};
let count = 0;

files.forEach(file => {
  if (!file.toLowerCase().endsWith(".pdf")) return;

  const parsed = parseFileName(file);
  if (!parsed) return;

  const { stockCode, date, type, title } = parsed;

  if (!stocks[stockCode]) stocks[stockCode] = [];

  stocks[stockCode].push({
    title,
    file,
    date,
    type
  });

  count++;
});

/* ================================
   정렬 (최신순)
================================ */
Object.values(stocks).forEach(list =>
  list.sort((a, b) => b.date.localeCompare(a.date))
);

/* ================================
   JSON 출력
================================ */
const output = {
  generatedAt: nowISO(),
  count,
  stocks
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log(
  `reports.json 생성 완료 (${count} files)`
);
