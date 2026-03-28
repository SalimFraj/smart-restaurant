import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getRecommendations as getGroqRecommendations, getChatResponse } from '../services/groqService.js';

export const getRecommendations = async (req, res, next) => {
  try {
    // Try to get user from optional auth
    let userId = null;
    try {
      const token = req.cookies?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) userId = user._id;
      }
    } catch (e) {
      // User not authenticated, continue without user history
    }

    let userHistory = [];
    if (userId) {
      const orders = await Order.find({ user: userId })
        .populate('items.menuItem', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      userHistory = orders.flatMap(order =>
        order.items.map(item => ({ name: item.name }))
      );
    }

    const menuItems = await MenuItem.find({ available: true });

    const recommendedNames = await getGroqRecommendations(userHistory, menuItems);

    const recommendations = menuItems.filter(item =>
      recommendedNames.some(name =>
        item.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(item.name.toLowerCase())
      )
    ).slice(0, 5);

    // If not enough matches, add popular items
    if (recommendations.length < 5) {
      const popular = await MenuItem.find({ available: true })
        .sort({ popularity: -1 })
        .limit(5 - recommendations.length);

      const existingIds = recommendations.map(r => r._id.toString());
      recommendations.push(...popular.filter(p => !existingIds.includes(p._id.toString())));
    }

    res.json({ success: true, data: recommendations.slice(0, 5) });
  } catch (error) {
    console.error('Recommendations error:', error);
    // Return popular items as fallback
    try {
      const popular = await MenuItem.find({ available: true })
        .sort({ popularity: -1 })
        .limit(5);
      res.json({ success: true, data: popular });
    } catch (fallbackError) {
      res.json({ success: true, data: [] });
    }
  }
};

export const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Limit message length to prevent abuse
    const sanitizedMessage = String(message).slice(0, 500);

    // Sanitize conversation history - only allow valid roles and limit content length
    const sanitizedHistory = history
      .filter(msg => msg && (msg.role === 'user' || msg.role === 'assistant') && msg.content)
      .slice(-10)
      .map(msg => ({
        role: msg.role,
        content: String(msg.content).slice(0, 500)
      }));

    const menuItems = await MenuItem.find({ available: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = await Reservation.find({
      date: { $gte: today, $lt: tomorrow }
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Pass sanitized conversation history to getChatResponse for context
    const stream = await getChatResponse(sanitizedMessage, menuItems, reservations, sanitizedHistory);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    // Send error message to client
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get AI response. Please check if GROQ_API_KEY is set.'
      });
    } else {
      res.write(`data: ${JSON.stringify({ content: '\n\nSorry, I encountered an error. Please check if the AI service is configured correctly.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
};

// Get pairing suggestions based on cart contents
export const getPairings = async (req, res, next) => {
  try {
    const { cartItems = [] } = req.body;

    if (cartItems.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const menuItems = await MenuItem.find({ available: true });
    const { getPairingSuggestions } = await import('../services/groqService.js');

    const suggestedNames = await getPairingSuggestions(cartItems, menuItems);

    // Match suggested names to actual menu items
    const suggestions = menuItems.filter(item =>
      suggestedNames.some(name =>
        item.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(item.name.toLowerCase())
      )
    ).slice(0, 3);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Pairing suggestions error:', error);
    res.json({ success: true, data: [] });
  }
};

// Estimate order completion time
export const getOrderEstimate = async (req, res, next) => {
  try {
    // Get pending/preparing orders count
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'preparing'] }
    });

    // Base time: 15 mins + 5 mins per active order (capped)
    const baseTime = 15;
    const perOrderTime = 5;
    const maxAdditionalTime = 30;

    const additionalTime = Math.min(activeOrders * perOrderTime, maxAdditionalTime);
    const estimatedMinutes = baseTime + additionalTime;

    // Get current hour for time-based adjustments
    const hour = new Date().getHours();
    let rushMultiplier = 1;

    // Lunch rush (11-14) or dinner rush (17-20)
    if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
      rushMultiplier = 1.3;
    }

    const finalEstimate = Math.round(estimatedMinutes * rushMultiplier);

    res.json({
      success: true,
      data: {
        estimatedMinutes: finalEstimate,
        activeOrders,
        isRushHour: rushMultiplier > 1,
        message: finalEstimate <= 20
          ? 'Quick preparation expected!'
          : finalEstimate <= 35
            ? 'Moderate wait time'
            : 'We\'re busy - your patience is appreciated!'
      }
    });
  } catch (error) {
    console.error('Order estimate error:', error);
    res.json({
      success: true,
      data: { estimatedMinutes: 25, message: 'Standard preparation time' }
    });
  }
};

