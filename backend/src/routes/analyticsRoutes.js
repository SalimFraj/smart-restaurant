import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Reservation from '../models/Reservation.js';
import Feedback from '../models/Feedback.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/revenue', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'day') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    });

    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;

    res.json({ success: true, data: { revenue, orderCount, period } });
  } catch (error) {
    next(error);
  }
});

router.get('/top-dishes', authenticate, adminOnly, async (req, res, next) => {
  try {
    const topDishes = await MenuItem.find()
      .sort({ popularity: -1 })
      .limit(5)
      .select('name popularity price');

    res.json({ success: true, data: topDishes });
  } catch (error) {
    next(error);
  }
});

router.get('/order-status', authenticate, adminOnly, async (req, res, next) => {
  try {
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const data = statusCounts.map(item => ({
      name: item._id,  // Recharts PieChart uses 'name' for labels
      count: item.count
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue-chart', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let days = 7;

    if (period === 'day') days = 1;
    else if (period === 'month') days = 30;

    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await Order.find({
        createdAt: { $gte: date, $lt: nextDate },
        status: { $ne: 'cancelled' }
      });

      const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      data.push({
        date: date.toISOString().split('T')[0],
        revenue,
        orders: orders.length
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/export-csv', authenticate, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    let csv = 'Order ID,Date,Customer,Email,Items,Total,Status\n';
    orders.forEach(order => {
      const items = order.items.map(i => `${i.name} x${i.quantity}`).join('; ');
      csv += `${order._id},${order.createdAt.toISOString()},${order.user?.name || 'N/A'},${order.user?.email || 'N/A'},${items},$${order.totalAmount},${order.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

