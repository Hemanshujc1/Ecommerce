"use client";
import React, { useState, useEffect } from 'react';
import { getUserOrders, cancelOrder, createReturnExchangeRequest, getOrderById } from '@/lib/api';
import { FaEye, FaTimes, FaUndo, FaExchangeAlt, FaShippingFast, FaCheckCircle } from 'react-icons/fa';

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
      // First, get the full order details to access items
      const orderDetailsResponse = await getOrderById(selectedOrder.id);
      if (!orderDetailsResponse.success || !orderDetailsResponse.data.items) {
        alert('Unable to fetch order details. Please try again.');
        return;
      }

      const orderItems = orderDetailsResponse.data.items;
      
      // For now, create a return/exchange request for the first item
      // In a real application, you'd want to let the user select which items to return/exchange
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
      case 'confirmed': return <FaCheckCircle className="w-4 h-4" />;
      case 'processing': return <FaShippingFast className="w-4 h-4" />;
      case 'shipped': return <FaShippingFast className="w-4 h-4" />;
      case 'delivered': return <FaCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FaTimes className="w-4 h-4" />;
      case 'returned': return <FaUndo className="w-4 h-4" />;
      default: return <FaShippingFast className="w-4 h-4" />;
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)}
                    {order.order_status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">₹{order.final_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-sm text-gray-900">{order.payment_method || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="text-sm text-gray-900">{order.item_count || 0} item(s)</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewOrder(order.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FaEye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  {canCancelOrder(order.order_status) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setActionType('cancel');
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <FaTimes className="w-4 h-4" />
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
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      >
                        <FaUndo className="w-4 h-4" />
                        Return
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType('exchange');
                          setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        <FaExchangeAlt className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {actionType === 'view' ? 'Order Details' : 
                   actionType === 'cancel' ? 'Cancel Order' :
                   actionType === 'return' ? 'Return Order' : 'Exchange Order'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {actionType === 'view' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-semibold">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                        {getStatusIcon(selectedOrder.order_status)}
                        {selectedOrder.order_status}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-semibold">₹{selectedOrder.final_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold">{selectedOrder.payment_method || 'N/A'}</p>
                    </div>
                  </div>

                  {selectedOrder.shipping_address && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Shipping Address</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p>{selectedOrder.shipping_address.full_name}</p>
                        <p>{selectedOrder.shipping_address.address_line_1}</p>
                        {selectedOrder.shipping_address.address_line_2 && (
                          <p>{selectedOrder.shipping_address.address_line_2}</p>
                        )}
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                        <p>{selectedOrder.shipping_address.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Order Items</p>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium">{item.product_name || `Product ID: ${item.product_id}`}</p>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
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
                  <p className="text-gray-600">
                    {actionType === 'cancel' ? 'Please provide a reason for cancelling this order:' :
                     actionType === 'return' ? 'Please provide a reason for returning this order:' :
                     'Please provide a reason for exchanging this order:'}
                  </p>
                  
                  {(actionType === 'return' || actionType === 'exchange') && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        Note: This will create a {actionType} request for the first item in your order.
                      </p>
                      <p className="text-xs text-blue-600">
                        For multiple items, you may need to create separate requests.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for {actionType}:
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setReason('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={actionType === 'cancel' ? handleCancelOrder : handleReturnExchange}
                      disabled={!reason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionType === 'cancel' ? 'Cancel Order' :
                       actionType === 'return' ? 'Submit Return Request' :
                       'Submit Exchange Request'}
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
