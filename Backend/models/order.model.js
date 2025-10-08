// models/order.model.js
const { createConnection } = require("../db/mysql12");

const OrderModel = {
  // Create new order
  createOrder: async (orderData) => {
    const conn = await createConnection();
    try {
      await conn.beginTransaction();

      // Generate unique order number
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Insert main order
      const [orderResult] = await conn.query(
        `INSERT INTO orders (
          user_id, order_number, total_amount, discount_amount, shipping_amount, 
          tax_amount, final_amount, payment_method, shipping_address, billing_address, 
          phone, email, notes, estimated_delivery_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.userId,
          orderNumber,
          orderData.totalAmount,
          orderData.discountAmount || 0,
          orderData.shippingAmount || 0,
          orderData.taxAmount || 0,
          orderData.finalAmount,
          orderData.paymentMethod,
          JSON.stringify(orderData.shippingAddress),
          JSON.stringify(orderData.billingAddress || orderData.shippingAddress),
          orderData.phone,
          orderData.email,
          orderData.notes || '',
          orderData.estimatedDeliveryDate
        ]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of orderData.items) {
        await conn.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_image, quantity, 
            unit_price, total_price, size, color
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.productImage,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            item.size || '',
            item.color || ''
          ]
        );
      }

      // Insert initial status history
      await conn.query(
        `INSERT INTO order_status_history (order_id, status, comment) VALUES (?, ?, ?)`,
        [orderId, 'pending', 'Order placed successfully']
      );

      // Clear user's cart after successful order
      await conn.query(
        `DELETE FROM user_cart WHERE user_id = ?`,
        [orderData.userId]
      );

      await conn.commit();
      return { success: true, orderId, orderNumber };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get all orders (admin)
  getAllOrders: async (limit = 50, offset = 0, status = null) => {
    const conn = await createConnection();
    try {
      let query = `
        SELECT o.*, u.name as user_name, u.email as user_email,
               COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN userinfo u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
      `;
      
      const params = [];
      if (status) {
        query += ` WHERE o.order_status = ?`;
        params.push(status);
      }
      
      query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [orders] = await conn.query(query, params);
      return orders;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get user orders
  getUserOrders: async (userId, limit = 20, offset = 0) => {
    const conn = await createConnection();
    try {
      const [orders] = await conn.query(
        `SELECT o.*, COUNT(oi.id) as item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      return orders;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get order by ID with items
  getOrderById: async (orderId) => {
    const conn = await createConnection();
    try {
      // Get order details
      const [orders] = await conn.query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         LEFT JOIN userinfo u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
      );

      if (orders.length === 0) return null;

      const order = orders[0];

      // Get order items
      const [items] = await conn.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [orderId]
      );

      // Get status history
      const [statusHistory] = await conn.query(
        `SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC`,
        [orderId]
      );

      // Get shipping info
      const [shippingInfo] = await conn.query(
        `SELECT * FROM shipping_info WHERE order_id = ?`,
        [orderId]
      );

      order.items = items;
      order.statusHistory = statusHistory;
      order.shippingInfo = shippingInfo[0] || null;
      order.shipping_address = JSON.parse(order.shipping_address);
      order.billing_address = JSON.parse(order.billing_address);

      return order;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, comment = '', changedBy = null) => {
    const conn = await createConnection();
    try {
      await conn.beginTransaction();

      // Update order status
      await conn.query(
        `UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, orderId]
      );

      // Add to status history
      await conn.query(
        `INSERT INTO order_status_history (order_id, status, comment, changed_by) VALUES (?, ?, ?, ?)`,
        [orderId, status, comment, changedBy]
      );

      await conn.commit();
      return { success: true };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.end();
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '', userId = null) => {
    const conn = await createConnection();
    try {
      await conn.beginTransaction();

      // Check if order can be cancelled
      const [orders] = await conn.query(
        `SELECT order_status FROM orders WHERE id = ?`,
        [orderId]
      );

      if (orders.length === 0) {
        throw new Error('Order not found');
      }

      const currentStatus = orders[0].order_status;
      if (['delivered', 'cancelled', 'returned'].includes(currentStatus)) {
        throw new Error('Order cannot be cancelled');
      }

      // Update order status
      await conn.query(
        `UPDATE orders SET order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [orderId]
      );

      // Add to status history
      await conn.query(
        `INSERT INTO order_status_history (order_id, status, comment, changed_by) VALUES (?, ?, ?, ?)`,
        [orderId, 'cancelled', reason || 'Order cancelled by user', userId]
      );

      await conn.commit();
      return { success: true };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.end();
    }
  },

  // Create return/exchange request
  createReturnExchangeRequest: async (requestData) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `INSERT INTO return_exchange_requests (
          order_id, order_item_id, user_id, request_type, reason, description, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          requestData.orderId,
          requestData.orderItemId,
          requestData.userId,
          requestData.requestType,
          requestData.reason,
          requestData.description,
          JSON.stringify(requestData.images || [])
        ]
      );

      return { success: true, requestId: result.insertId };
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get return/exchange requests
  getReturnExchangeRequests: async (userId = null, status = null) => {
    const conn = await createConnection();
    try {
      let query = `
        SELECT rer.*, o.order_number, oi.product_name, oi.product_image,
               u.name as user_name, u.email as user_email
        FROM return_exchange_requests rer
        LEFT JOIN orders o ON rer.order_id = o.id
        LEFT JOIN order_items oi ON rer.order_item_id = oi.id
        LEFT JOIN userinfo u ON rer.user_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      if (userId) {
        query += ` AND rer.user_id = ?`;
        params.push(userId);
      }
      if (status) {
        query += ` AND rer.status = ?`;
        params.push(status);
      }
      
      query += ` ORDER BY rer.created_at DESC`;

      const [requests] = await conn.query(query, params);
      
      // Parse images JSON
      requests.forEach(request => {
        request.images = JSON.parse(request.images || '[]');
      });

      return requests;
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Update return/exchange request status
  updateReturnExchangeStatus: async (requestId, status, adminComment = '', processedBy = null, refundAmount = null) => {
    const conn = await createConnection();
    try {
      const [result] = await conn.query(
        `UPDATE return_exchange_requests 
         SET status = ?, admin_comment = ?, processed_by = ?, refund_amount = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, adminComment, processedBy, refundAmount, requestId]
      );

      return { success: true, affectedRows: result.affectedRows };
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  },

  // Get order statistics
  getOrderStats: async () => {
    const conn = await createConnection();
    try {
      const [stats] = await conn.query(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN order_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
          SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
          SUM(CASE WHEN order_status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
          SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(CASE WHEN order_status = 'returned' THEN 1 ELSE 0 END) as returned_orders,
          SUM(final_amount) as total_revenue,
          AVG(final_amount) as average_order_value
        FROM orders
      `);

      return stats[0];
    } catch (err) {
      throw err;
    } finally {
      conn.end();
    }
  }
};

module.exports = OrderModel;