export default function ProductGanttPage() {
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-8">
        {/* Gantt Chart Placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gantt Chart View</h3>
          <p className="text-gray-500">
            Interactive Gantt chart visualization will be displayed here
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 bg-indigo-600 rounded"></span>
              <span>Active Projects</span>
              <span className="w-3 h-3 bg-yellow-500 rounded ml-4"></span>
              <span>Pending</span>
              <span className="w-3 h-3 bg-green-500 rounded ml-4"></span>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
