'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmitProduct = (data: any) => {
    console.log('Producto creado:', data);
    // Aquí puedes agregar la lógica para enviar a la API
    alert('¡Producto creado exitosamente!');
  };

  return (
    <div className="px-3 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Biofincas
          </h1>
          <p className="text-gray-600">
            Loan Management Dashboard
          </p>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
            <span className="text-indigo-600 text-2xl">📦</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">24</div>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Loans</h3>
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">18</div>
          <p className="text-sm text-green-600 mt-2">+8% from last month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Value</h3>
            <span className="text-yellow-600 text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">$2.4M</div>
          <p className="text-sm text-green-600 mt-2">+15% from last month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <span className="text-orange-600 text-2xl">⏳</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">6</div>
          <p className="text-sm text-gray-600 mt-2">Awaiting approval</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/products/list"
            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
              View Products
            </h3>
            <p className="text-sm text-gray-600">Browse all loan products</p>
          </a>

          <a
            href="/products/gantt"
            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
              View Timeline
            </h3>
            <p className="text-sm text-gray-600">Check project schedules</p>
          </a>

          <a
            href="/products/metrics"
            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
              View Analytics
            </h3>
            <p className="text-sm text-gray-600">Performance metrics</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Home Loan Premium approved</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Car Loan Standard pending review</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Business Booster completed</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
