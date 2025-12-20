export default function OrderHistorySection() {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Title */}
      <h3 className="mb-2 text-sm font-semibold tracking-wide text-indigo-300">
        🧾 체결내역
      </h3>

      {/* Placeholder */}
      <p className="text-sm text-gray-400">
        체결내역 리스트가 여기에 표시됩니다.
      </p>
    </div>
  );
}
