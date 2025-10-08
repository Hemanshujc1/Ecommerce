"use client";

import React, { useState, useEffect } from "react";
import { 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  getReturnExchangeRequests, 
  updateReturnExchangeStatus,
  getOrderStats 
} from "@/lib/api";
import { 
  FaEye, 
  FaEdit, 
  FaCheck, 
  FaTimes, 
  FaShippingFast, 
  FaUndo, 
  FaExchangeAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaChartBar
} from "react-icons/fa";

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [returnExchangeRequests, setReturnExchangeRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'status', 'return-exchange'
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Orders state updated:', orders.length, 'orders');
    if (orders.length > 0) {
      console.log('First order status:', orders[0].order_status);
    }
  }, [orders]);

  useEffect(() => {
    console.log('Return/Exchange requests state updated:', returnExchangeRequests.length, 'requests');
    if (returnExchangeRequests.length > 0) {
      console.log('First request type:', returnExchangeRequests[0].request_type);
      console.log('First request status:', returnExchangeRequests[0].status);
    }
  }, [returnExchangeRequests]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin data...');
      const [ordersRes, returnExchangeRes, statsRes] = await Promise.all([
        getAllOrders(100, 0),
        getReturnExchangeRequests(),
        getOrderStats()
      ]);

      if (ordersRes && ordersRes.success) {
        console.log('Orders fetched:', ordersRes.data.length, 'orders');
        console.log('First order status:', ordersRes.data[0]?.order_status);
        setOrders(ordersRes.data);
      }
      
      if (returnExchangeRes && returnExchangeRes.success) {
        console.log('✅ Setting return/exchange requests:', returnExchangeRes.data.length, 'requests');
        setReturnExchangeRequests(returnExchangeRes.data);
      } else {
        console.error('❌ Failed to fetch return/exchange requests:', returnExchangeRes);
      }
      
      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setModalType('view');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleUpdateOrderStatus = async () => {
    try {
      console.log('🔄 Updating order status:', selectedOrder.id, 'from', selectedOrder.order_status, 'to', newStatus);
      
      // Show loading state
      setLoading(true);
      
      const response = await updateOrderStatus(selectedOrder.id, newStatus, statusComment, 1);
      console.log('📊 Update response:', response);
      
      if (response && response.success) {
        console.log('✅ Status update successful, refreshing data...');
        
        // Close modal
        setShowModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        setStatusComment('');
        
        // Refresh all data from server
        await fetchData();
        
        console.log('✅ Status update completed successfully');
        
        // Show success message
        setTimeout(() => {
          alert('Order status updated successfully!');
        }, 100);
      } else {
        console.error('❌ Status update failed:', response);
        alert('Failed to update order status. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Error updating order status. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateReturnExchange = async (requestId, status, comment = '', refundAmount = null) => {
    try {
      const response = await updateReturnExchangeStatus(requestId, status, comment, 1, refundAmount); // Use actual admin ID from auth context
      if (response.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating return/exchange request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'returned': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaShippingFast className="w-4 h-4" />;
      case 'confirmed': return <FaCheck className="w-4 h-4" />;
      case 'processing': return <FaShippingFast className="w-4 h-4" />;
      case 'shipped': return <FaShippingFast className="w-4 h-4" />;
      case 'delivered': return <FaCheck className="w-4 h-4" />;
      case 'cancelled': return <FaTimes className="w-4 h-4" />;
      case 'returned': return <FaUndo className="w-4 h-4" />;
      default: return <FaShippingFast className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.order_status?.toLowerCase() === filter;
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredReturnExchange = returnExchangeRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status?.toLowerCase() === filter;
    const matchesSearch = searchTerm === '' || 
      request.order_id.toString().includes(searchTerm) ||
      request.request_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const currentReturnExchange = filteredReturnExchange.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((activeTab === 'orders' ? filteredOrders.length : filteredReturnExchange.length) / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage orders, returns, and exchanges</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔄 Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FaDownload className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FaChartBar className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || orders.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaShippingFast className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.order_status?.toLowerCase() === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaShippingFast className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Requires attention</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returnExchangeRequests.filter(r => r.request_type === 'return').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaUndo className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Needs processing</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exchange Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returnExchangeRequests.filter(r => r.request_type === 'exchange').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaExchangeAlt className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Active requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'returns'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Returns & Exchanges
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 w-4 h-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">
                Showing {currentOrders.length} orders (Last updated: {new Date().toLocaleTimeString()})
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.user_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.user_email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)}
                            {order.order_status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.payment_method || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setModalType('status');
                                setNewStatus(order.order_status);
                                setShowModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Update Status"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-4">📦</div>
                        <p>No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Return/Exchange Requests Table */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReturnExchange.length > 0 ? (
                    currentReturnExchange.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{request.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.request_type === 'return' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {request.request_type === 'return' ? <FaUndo className="w-3 h-3 mr-1" /> : <FaExchangeAlt className="w-3 h-3 mr-1" />}
                            {request.request_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {request.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateReturnExchange(request.id, 'approved', 'Approved by admin')}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Approve"
                                >
                                  <FaCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateReturnExchange(request.id, 'rejected', 'Rejected by admin')}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Reject"
                                >
                                  <FaTimes className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-4">📋</div>
                        <p>No return/exchange requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, activeTab === 'orders' ? filteredOrders.length : filteredReturnExchange.length)} of{' '}
              {activeTab === 'orders' ? filteredOrders.length : filteredReturnExchange.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {modalType === 'view' ? 'Order Details' : 'Update Order Status'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedOrder(null);
                      setNewStatus('');
                      setStatusComment('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                {modalType === 'view' ? (
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Order ID:</span>
                              <span className="font-medium">#{selectedOrder.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span>{new Date(selectedOrder.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                                {getStatusIcon(selectedOrder.order_status)}
                                {selectedOrder.order_status}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-semibold">₹{selectedOrder.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span>{selectedOrder.payment_method || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span>{selectedOrder.user_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span>{selectedOrder.user_email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shipping_address && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium">{selectedOrder.shipping_address.full_name}</p>
                          <p>{selectedOrder.shipping_address.address_line_1}</p>
                          {selectedOrder.shipping_address.address_line_2 && (
                            <p>{selectedOrder.shipping_address.address_line_2}</p>
                          )}
                          <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                          <p>Phone: {selectedOrder.shipping_address.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                              <div>
                                <p className="font-medium">{item.product_name || `Product ID: ${item.product_id}`}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-semibold">₹{item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        placeholder="Add a comment about this status change..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setSelectedOrder(null);
                          setNewStatus('');
                          setStatusComment('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateOrderStatus}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrdersPage;
