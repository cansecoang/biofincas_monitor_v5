export default function IndicatorOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Indicators Overview</h1>
        <p className="text-gray-600">Key performance indicators and metrics dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Indicators</h3>
          <div className="text-3xl font-bold text-gray-900">24</div>
          <p className="text-sm text-green-600 mt-2">+4 this month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Tracking</h3>
          <div className="text-3xl font-bold text-gray-900">18</div>
          <p className="text-sm text-blue-600 mt-2">In monitoring</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Target Achievement</h3>
          <div className="text-3xl font-bold text-gray-900">87%</div>
          <p className="text-sm text-green-600 mt-2">+5% this quarter</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Indicators</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Production Efficiency</h3>
              <p className="text-sm text-gray-500">Target: 85% | Current: 92%</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              Above Target
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Quality Score</h3>
              <p className="text-sm text-gray-500">Target: 90% | Current: 88%</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
              Near Target
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Customer Satisfaction</h3>
              <p className="text-sm text-gray-500">Target: 95% | Current: 97%</p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              Excellent
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
