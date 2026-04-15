const { 
  Order, 
  OrderItem, 
  OrderStatusHistory, 
  ReturnExchangeRequest,
  sequelize 
} = require("../models");

const OrderService = {
  placeOrder: async (userId, orderData) => {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.create({
        user_id: userId,
        order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        total_amount: orderData.total_amount,
        discount_amount: orderData.discount_amount || 0,
        shipping_amount: orderData.shipping_amount || 0,
        tax_amount: orderData.tax_amount || 0,
        final_amount: orderData.final_amount,
        payment_method: orderData.payment_method,
        shipping_address: orderData.shipping_address, // JSON
        billing_address: orderData.billing_address, // JSON
        phone: orderData.phone,
        email: orderData.email,
        notes: orderData.notes,
        estimated_delivery_date: orderData.estimated_delivery_date,
        order_status: 'pending',
        shipping_status: 'not_shipped'
      }, { transaction });

      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          size: item.size,
          color: item.color
        }));
        await OrderItem.bulkCreate(orderItems, { transaction });
      }

      // Initial status history
      await OrderStatusHistory.create({
        order_id: order.id,
        status: 'pending',
        comment: 'Order placed successfully',
        changed_by: null // System
      }, { transaction });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getAllOrders: async (filters = {}) => {
    const where = {};
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.status) where.order_status = filters.status;

    return await Order.findAll({
      where,
      include: [
        { model: OrderItem, as: 'items' }
      ],
      order: [['created_at', 'DESC']]
    });
  },

  getOrderById: async (orderId) => {
    return await Order.findByPk(orderId, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderStatusHistory, as: 'statusHistory' },
        { model: ReturnExchangeRequest, as: 'returnRequests' }
      ]
    });
  },

  updateOrderStatus: async (orderId, statusData) => {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(orderId);
      if (!order) throw new Error("Order not found");

      const updateFields = { order_status: statusData.status };
      
      // If shipping details are provided in status update
      if (statusData.shipping_carrier) updateFields.shipping_carrier = statusData.shipping_carrier;
      if (statusData.shipping_tracking_number) updateFields.shipping_tracking_number = statusData.shipping_tracking_number;
      if (statusData.shipping_status) updateFields.shipping_status = statusData.shipping_status;

      await order.update(updateFields, { transaction });

      await OrderStatusHistory.create({
        order_id: orderId,
        status: statusData.status,
        comment: statusData.comment,
        changed_by: statusData.admin_id
      }, { transaction });

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getReturnExchangeRequests: async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.user_id = filters.userId;

    return await ReturnExchangeRequest.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
  },

  updateReturnExchangeStatus: async (requestId, statusData) => {
    const request = await ReturnExchangeRequest.findByPk(requestId);
    if (!request) throw new Error("Request not found");

    await request.update({
      status: statusData.status,
      admin_comment: statusData.comment,
      processed_by: statusData.admin_id,
      refund_amount: statusData.refund_amount
    });

    return { success: true };
  },

  getOrderStats: async () => {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { order_status: 'pending' } });
    const completedOrders = await Order.count({ where: { order_status: 'delivered' } });
    
    // Using raw query for revenue calculation if needed, or sequelize fn
    const totalRevenue = await Order.sum('final_amount', {
      where: { order_status: ['delivered', 'shipped', 'processing', 'confirmed'] }
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue || 0
    };
  }
};

module.exports = OrderService;