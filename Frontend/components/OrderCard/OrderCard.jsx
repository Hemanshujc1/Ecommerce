"use client";
import React, { useState, useEffect } from 'react';
import { getUserOrders, cancelOrder, createReturnExchangeRequest, getOrderById } from '@/lib/api';
import { FaEye, FaTimes, FaUndo, FaExchangeAlt, FaShippingFast, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

const OrderCard = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders(userId);
      if (response && response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setActionType('view');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await cancelOrder(selectedOrder.id, reason, userId);
      if (response.success) {
        await fetchUserOrders();
        setShowModal(false);
        setReason('');
        alert('Order cancelled successfully!');
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order. Please try again.');
    }
  };

  const handleReturnExchange = async () => {
    try {
      const orderDetailsResponse = await getOrderById(selectedOrder.id);
      if (!orderDetailsResponse.success || !orderDetailsResponse.data.items) {
        alert('Unable to fetch order details. Please try again.');
        return;
      }

      const orderItems = orderDetailsResponse.data.items;
      
      if (orderItems.length === 0) {
        alert('No items found in this order.');
        return;
      }

      const firstItem = orderItems[0];
      const requestData = {
        orderId: selectedOrder.id,
        orderItemId: firstItem.id,
        userId: userId,
        requestType: actionType,
        reason: reason,
        description: `${actionType === 'return' ? 'Return' : 'Exchange'} request for ${firstItem.product_name}`
      };
      
      const response = await createReturnExchangeRequest(requestData);
      if (response.success) {
        await fetchUserOrders();
        setShowModal(false);
        setReason('');
        alert(`${actionType === 'return' ? 'Return' : 'Exchange'} request submitted successfully!`);
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error creating return/exchange request:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'returned': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-705 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaShippingFast className="w-3.5 h-3.5" />;
      case 'confirmed': return <FaCheckCircle className="w-3.5 h-3.5" />;
      case 'processing': return <FaShippingFast className="w-3.5 h-3.5" />;
      case 'shipped': return <FaShippingFast className="w-3.5 h-3.5" />;
      case 'delivered': return <FaCheckCircle className="w-3.5 h-3.5" />;
      case 'cancelled': return <FaTimes className="w-3.5 h-3.5" />;
      case 'returned': return <FaUndo className="w-3.5 h-3.5" />;
      default: return <FaShippingFast className="w-3.5 h-3.5" />;
    }
  };

  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status?.toLowerCase());
  };

  const canReturnOrder = (status) => {
    return ['delivered'].includes(status?.toLowerCase());
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.order_status?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p className="text-sm text-gray-500 font-light">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-4">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === status
                ? 'bg-black text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
          <div className="text-gray-300 text-5xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-500 mb-6 font-light">You don't have any orders with this status filter.</p>
          <Link 
            href="/users/Products" 
            className="inline-flex bg-black text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-200">
              <div className="p-6 space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900">Order #{order.id}</h3>
                    <p className="text-xs text-gray-500 font-light">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)}
                    {order.order_status}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Amount</p>
                    <p className="font-bold text-gray-900">₹{order.final_amount}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Mode</p>
                    <p className="font-bold text-gray-950 uppercase text-xs">{order.payment_method || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity</p>
                    <p className="font-bold text-gray-900">{order.item_count || 0} item(s)</p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleViewOrder(order.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition active:scale-[0.98]"
                  >
                    <FaEye />
                    View Details
                  </button>
                  
                  {canCancelOrder(order.order_status) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setActionType('cancel');
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-100 transition active:scale-[0.98]"
                    >
                      <FaTimes />
                      Cancel Order
                    </button>
                  )}
                  
                  {canReturnOrder(order.order_status) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType('return');
                          setShowModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-orange-100 transition active:scale-[0.98]"
                      >
                        <FaUndo />
                        Return
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType('exchange');
                          setShowModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-100 transition active:scale-[0.98]"
                      >
                        <FaExchangeAlt />
                        Exchange
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Overlay Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                {actionType === 'view' ? 'Order Details' : 
                 actionType === 'cancel' ? 'Cancel Order' :
                 actionType === 'return' ? 'Return Request' : 'Exchange Request'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason('');
                }}
                className="text-gray-400 hover:text-black p-1 transition"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-black">
              {actionType === 'view' ? (
                <div className="space-y-6">
                  
                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-450 uppercase tracking-wider">Order ID</p>
                      <p className="font-bold text-gray-900">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-450 uppercase tracking-wider">Status</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide mt-1 ${getStatusColor(selectedOrder.order_status)}`}>
                        {getStatusIcon(selectedOrder.order_status)}
                        {selectedOrder.order_status}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-450 uppercase tracking-wider">Total Amount</p>
                      <p className="font-bold text-gray-900">₹{selectedOrder.final_amount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-450 uppercase tracking-wider">Payment Mode</p>
                      <p className="font-bold text-gray-900 uppercase text-xs mt-0.5">{selectedOrder.payment_method || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Address</p>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-light text-gray-600 space-y-0.5">
                        <p className="font-bold text-gray-800">{selectedOrder.shipping_address.full_name}</p>
                        <p>{selectedOrder.shipping_address.address_line_1}</p>
                        {selectedOrder.shipping_address.address_line_2 && (
                          <p>{selectedOrder.shipping_address.address_line_2}</p>
                        )}
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                        <p className="mt-1 font-normal text-gray-700">Phone: {selectedOrder.shipping_address.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</p>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                            <div className="space-y-1">
                              <p className="font-bold text-gray-950">{item.product_name || `Product ID: ${item.product_id}`}</p>
                              <p className="text-xs text-gray-500 font-light">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-black text-gray-900">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-600 font-light leading-relaxed">
                    {actionType === 'cancel' ? 'Please provide a valid reason for cancelling this order:' :
                     actionType === 'return' ? 'Please choose the return reason for your refund request:' :
                     'Please specify the reason for seeking a product exchange:'}
                  </p>
                  
                  {(actionType === 'return' || actionType === 'exchange') && (
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-1">
                      <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">
                        Note: First Item Request
                      </p>
                      <p className="text-xs text-blue-700 font-light leading-normal">
                        This action processes a {actionType} request for the primary item in your order.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reason for {actionType}:
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50 text-sm transition appearance-none"
                    >
                      <option value="">Select a reason...</option>
                      <option value="defective">Product is defective</option>
                      <option value="wrong_item">Wrong item received</option>
                      <option value="size_issue">Size issue</option>
                      <option value="not_satisfied">Not satisfied with product</option>
                      <option value="damaged">Product arrived damaged</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setReason('');
                      }}
                      className="flex-1 px-4 py-3.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700 rounded-2xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={actionType === 'cancel' ? handleCancelOrder : handleReturnExchange}
                      disabled={!reason.trim()}
                      className="flex-1 px-4 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      {actionType === 'cancel' ? 'Cancel Order' :
                       actionType === 'return' ? 'Submit Return' :
                       'Submit Exchange'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
