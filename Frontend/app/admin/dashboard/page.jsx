"use client";

import React, { useState, useEffect } from "react";
import { 
  getAllOrders, 
  getOrderStats, 
  getReturnExchangeRequests,
  fetchAllProducts
} from "@/lib/api";
import {
  FaShoppingCart,
  FaUsers,
  FaBoxOpen,
  FaChartLine,
  FaUndo,
  FaExchangeAlt,
  FaArrowRight,
  FaClock,
  FaStore,
  FaWarehouse,
  FaMoneyBillWave,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    orderStats: {},
    returnExchangeRequests: [],
    products: [],
    loading: true,
    error: null
  });

  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      const [ordersRes, statsRes, returnExchangeRes, productsRes] = await Promise.all([
        getAllOrders(100, 0),
        getOrderStats(),
        getReturnExchangeRequests(),
        fetchAllProducts()
      ]);

      setDashboardData({
        orders: ordersRes?.success ? ordersRes.data : [],
        orderStats: statsRes?.success ? statsRes.data : {},
        returnExchangeRequests: returnExchangeRes?.success ? returnExchangeRes.data : [],
        products: Array.isArray(productsRes) ? productsRes : [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load dashboard data. Please try again.' 
      }));
    }
  };

  // Calculate derived statistics
  const calculateStats = () => {
    const { orders, returnExchangeRequests, products } = dashboardData;
    
    if (!Array.isArray(orders)) return {};
    
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(order => new Date(order.created_at) >= last7Days);
    const monthlyOrders = orders.filter(order => new Date(order.created_at) >= last30Days);
    
    const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
    const processingOrders = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.order_status)).length;
    const completedOrders = orders.filter(o => o.order_status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.order_status === 'cancelled').length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.final_amount || 0), 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.final_amount || 0), 0);
    
    const returnRequests = returnExchangeRequests.filter(r => r.request_type === 'return').length;
    const exchangeRequests = returnExchangeRequests.filter(r => r.request_type === 'exchange').length;
    const pendingRequests = returnExchangeRequests.filter(r => r.status === 'pending').length;

    return {
      totalOrders: orders.length,
      recentOrders: recentOrders.length,
      monthlyOrders: monthlyOrders.length,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      monthlyRevenue,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      returnRequests,
      exchangeRequests,
      pendingRequests,
      totalProducts: products.length,
      lowStockProducts: products.filter(p => (p.stock_quantity || 0) < 10).length
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const prepareOrdersChartData = () => {
    const { orders } = dashboardData;
    if (!Array.isArray(orders)) return [];
    
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === date.toDateString();
      });
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + parseFloat(order.final_amount || 0), 0)
      });
    }
    
    return last7Days;
  };

  const prepareStatusChartData = () => {
    const statusData = [
      { name: 'Pending', value: stats.pendingOrders || 0, color: '#fbbf24' },
      { name: 'Processing', value: stats.processingOrders || 0, color: '#3b82f6' },
      { name: 'Completed', value: stats.completedOrders || 0, color: '#10b981' },
      { name: 'Cancelled', value: stats.cancelledOrders || 0, color: '#ef4444' },
    ];
    return statusData.filter(item => item.value > 0);
  };

  const getRecentActivity = () => {
    const { orders, returnExchangeRequests } = dashboardData;
    const activities = [];

    // Recent orders
    if (Array.isArray(orders)) {
      orders.slice(0, 5).forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          message: `New order #${order.id} placed`,
          time: order.created_at,
          status: order.order_status,
          amount: order.final_amount
        });
      });
    }

    // Recent return/exchange requests
    if (Array.isArray(returnExchangeRequests)) {
      returnExchangeRequests.slice(0, 3).forEach(request => {
        activities.push({
          id: `request-${request.id}`,
          type: request.request_type,
          message: `${request.request_type} request for order #${request.order_id}`,
          time: request.created_at,
          status: request.status
        });
      });
    }

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
  };

  // Loading skeleton
  if (dashboardData.loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardData.error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{dashboardData.error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const chartData = prepareOrdersChartData();
  const statusChartData = prepareStatusChartData();
  const recentActivity = getRecentActivity();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  <IoMdTrendingUp className="inline w-3 h-3 mr-1" />
                  {stats.recentOrders || 0} this week
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  <IoMdTrendingUp className="inline w-3 h-3 mr-1" />
                  ₹{(stats.monthlyRevenue || 0).toLocaleString()} this month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaMoneyBillWave className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  <FaClock className="inline w-3 h-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests || 0}</p>
                <p className="text-xs text-red-600 mt-1">
                  <FaUndo className="inline w-3 h-3 mr-1" />
                  {stats.returnRequests || 0} returns, {stats.exchangeRequests || 0} exchanges
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaUndo className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders Trend Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Orders Trend</h3>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 p-4 bg-gray-50 rounded-lg">
              {chartData.map((day, index) => {
                const maxOrders = Math.max(...chartData.map(d => d.orders), 1);
                const height = Math.max((day.orders / maxOrders) * 200, 8);
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${height}px` }}
                      title={`${day.orders} orders on ${day.date} - Revenue: ₹${day.revenue.toLocaleString()}`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 text-center">{day.date.split(' ')[0]}</span>
                    <span className="text-xs font-semibold text-gray-900">{day.orders}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Total: {chartData.reduce((sum, day) => sum + day.orders, 0)} orders this week
              </p>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
              <span className="text-sm text-gray-500">Current status</span>
            </div>
            <div className="space-y-4">
              {statusChartData.length > 0 ? statusChartData.map((status, index) => {
                const total = statusChartData.reduce((sum, s) => sum + s.value, 0);
                const percentage = total > 0 ? (status.value / total) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{status.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: status.color 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {status.value}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBoxOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No orders to display</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-600">{stats.processingOrders || 0}</p>
                  <p className="text-xs text-gray-600">Processing</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">{stats.completedOrders || 0}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">{stats.cancelledOrders || 0}</p>
                  <p className="text-xs text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <a 
                href="/admin/ManageOrders"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                View All <FaArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'order' ? 'bg-blue-100' :
                      activity.type === 'return' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'order' ? (
                        <FaShoppingCart className="w-4 h-4 text-blue-600" />
                      ) : activity.type === 'return' ? (
                        <FaUndo className="w-4 h-4 text-red-600" />
                      ) : (
                        <FaExchangeAlt className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.time).toLocaleDateString('en-IN')} at{' '}
                        {new Date(activity.time).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-semibold text-gray-900">₹{activity.amount}</p>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendarAlt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="font-semibold">₹{(stats.averageOrderValue || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Products</span>
                <span className="font-semibold">{stats.totalProducts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="font-semibold text-red-600">{stats.lowStockProducts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing Orders</span>
                <span className="font-semibold text-blue-600">{stats.processingOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Orders</span>
                <span className="font-semibold text-green-600">{stats.completedOrders || 0}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <a 
                  href="/admin/ManageOrders" 
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FaEye className="w-4 h-4" />
                  View Pending Orders
                </a>
                <a 
                  href="/admin/ManageOrders" 
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaUndo className="w-4 h-4" />
                  Process Returns
                </a>
                <a 
                  href="/admin/AddProducts" 
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <FaBoxOpen className="w-4 h-4" />
                  Add New Product
                </a>
                <a 
                  href="/admin/ManageProducts" 
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <FaStore className="w-4 h-4" />
                  Manage Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;