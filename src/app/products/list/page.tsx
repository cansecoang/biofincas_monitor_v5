export default function ProductListPage() {
  // Datos de ejemplo
  const products = [
    { id: 1, name: 'Home Loan Premium', type: 'Home Loan', status: 'Active', amount: '$250,000', date: '2024-10-01' },
    { id: 2, name: 'Car Loan Standard', type: 'Car Loan', status: 'Pending', amount: '$45,000', date: '2024-10-05' },
    { id: 3, name: 'Home Renovation', type: 'Maintenance', status: 'Active', amount: '$30,000', date: '2024-09-28' },
    { id: 4, name: 'Business Booster', type: 'Booster', status: 'Active', amount: '$100,000', date: '2024-10-03' },
    { id: 5, name: 'Car Loan Premium', type: 'Car Loan', status: 'Completed', amount: '$55,000', date: '2024-09-15' },
  ];

  return (
    <div>
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{product.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${product.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                    ${product.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${product.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{product.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{product.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
