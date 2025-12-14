import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { emitNewOrder, emitOrderUpdate } from '../services/socketService.js';

/**
 * Creates a new order with validation and real-time notifications.
 * Validates item availability, calculates totals, updates item popularity metrics,
 * and notifies admins via WebSocket for immediate order processing.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, phone, specialInstructions, orderType = 'delivery' } = req.body;

    // Validate delivery address for delivery orders
    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({
        message: 'Delivery address is required for delivery orders'
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({
          message: `Item ${item.name || menuItem?.name} is not available`
        });
      }

      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      });

      // Track popularity for recommendation algorithms - increments each time item is ordered
      menuItem.popularity += item.quantity;
      await menuItem.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      phone,
      specialInstructions
    });

    await order.populate('items.menuItem', 'name image');
    await order.populate('user', 'name email');

    // Send real-time notification to all connected admins for immediate order handling
    emitNewOrder(order);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all orders for the authenticated user.
 * Orders are sorted by creation date (newest first) for better UX.
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all orders in the system (admin only).
 * Supports optional filtering by order status for order management workflows.
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single order by ID with authorization checks.
 * Users can only view their own orders; admins can view any order.
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.menuItem', 'name image description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an order's status (admin only) and notifies the customer.
 * Handles edge cases where user or menu items may have been deleted since order creation.
 * Sends real-time WebSocket notification to the customer about status changes.
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Gracefully handle deleted users or menu items - don't fail if references are gone
    await order.populate('user', 'name email').catch(() => { });
    await order.populate('items.menuItem', 'name image').catch(() => { });

    // Send real-time update to customer if their account still exists
    if (order.user && order.user._id) {
      emitOrderUpdate(order.user._id, order);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

