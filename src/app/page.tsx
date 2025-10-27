'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, BarChart3, Bell } from 'lucide-react';

interface DashboardStats {
  products: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
  };
  indicators: {
    total: number;
    assigned: number;
    avg_progress: number;
  };
  notifications: {
    upcoming_checkins: number;
  };
}

interface RecentActivity {
  product_id: number;
  product_name: string;
  delivery_date: string;
  country_name: string;
  workpackage_name: string;
  pending_tasks: number;
}

interface WorkpackageDistribution {
  workpackage_name: string;
  product_count: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [workpackageDistribution, setWorkpackageDistribution] = useState<WorkpackageDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
          setWorkpackageDistribution(data.workpackageDistribution);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-6">
        <div className="mb-4">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-5 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse"></div>
              </div>
              <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border-2 border-gray-200 rounded-2xl">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Workpackage Distribution Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-8 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completionRate = stats?.tasks.total 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  return (
    <div className="px-3 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Biofincas! | Project Dashboard
          </h1>
          <p className="text-gray-600">
            Monitoring & Performance Overview
          </p>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.products.total || 0}</div>
          <p className="text-sm text-gray-600 mt-2">
            {stats?.products.active || 0} active · {stats?.products.completed || 0} completed
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Tasks Progress</h3>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
          <p className="text-sm text-gray-600 mt-2">
            {stats?.tasks.completed || 0} of {stats?.tasks.total || 0} completed
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Indicators</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.indicators.total || 0}</div>
          <p className="text-sm text-gray-600 mt-2">
            {stats?.indicators.assigned || 0} assigned · {stats?.indicators.avg_progress.toFixed(1) || 0}% avg
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Upcoming Check-ins</h3>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.notifications.upcoming_checkins || 0}</div>
          <p className="text-sm text-gray-600 mt-2">Next 30 days</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/products/matrix"
            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
              Products
            </h3>
            <p className="text-sm text-gray-600">View products by output</p>
          </a>

          <a
            href="/products/gantt"
            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
              Timeline
            </h3>
            <p className="text-sm text-gray-600">Gantt chart view</p>
          </a>

          <a
            href="/indicators/overview"
            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
              Indicators
            </h3>
            <p className="text-sm text-gray-600">Performance metrics</p>
          </a>

          <a
            href="/create/product"
            className="p-4 border-2 border-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all group"
          >
            <h3 className="font-semibold text-indigo-600 mb-1">
              + New Product
            </h3>
            <p className="text-sm text-indigo-600">Create new product</p>
          </a>
        </div>
      </div>

      {/* Workpackage Distribution */}
      {workpackageDistribution.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Products by Workpackage</h2>
          <div className="space-y-3">
            {workpackageDistribution.map((wp, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate">
                    {wp.workpackage_name}
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.max((wp.product_count / Math.max(...workpackageDistribution.map(w => w.product_count))) * 100, 10)}%` 
                      }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {wp.product_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Products</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay productos registrados</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const deliveryDate = new Date(activity.delivery_date);
              const isUpcoming = deliveryDate >= new Date();
              const daysUntil = Math.ceil((deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={activity.product_id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.pending_tasks === 0 ? 'bg-green-500' :
                    isUpcoming ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.product_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{activity.country_name}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{activity.workpackage_name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.pending_tasks > 0 && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            {activity.pending_tasks} pending tasks
                          </span>
                        )}
                        {activity.pending_tasks === 0 && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            All tasks done
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Delivery: {deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {isUpcoming && daysUntil > 0 && (
                        <span className="ml-2 text-blue-600">({daysUntil} days)</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
