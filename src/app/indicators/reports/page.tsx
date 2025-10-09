export default function IndicatorReportsPage() {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-2xl hover:border-indigo-600 transition-colors cursor-pointer">
            <h3 className="font-medium text-gray-900 mb-1">Monthly Performance Report</h3>
            <p className="text-sm text-gray-500">Comprehensive monthly indicator analysis</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-2xl hover:border-indigo-600 transition-colors cursor-pointer">
            <h3 className="font-medium text-gray-900 mb-1">Quarterly KPI Summary</h3>
            <p className="text-sm text-gray-500">Key performance indicators summary</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-2xl hover:border-indigo-600 transition-colors cursor-pointer">
            <h3 className="font-medium text-gray-900 mb-1">Annual Trends Report</h3>
            <p className="text-sm text-gray-500">Year-over-year trend analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
