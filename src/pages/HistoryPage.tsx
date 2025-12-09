import HistoryReportSection from '../components/HistoryReport/HistoryReportSection';

export default function HistoryPage() {
  
  return (
    <div className="p-6 space-y-6">
      <div className="">
        <h2>포트폴리오 선택</h2>
        <button className="btn-tab btn-tab-active">Portfolio 1</button>
      </div>
      <HistoryReportSection />
    </div>
  );
}
