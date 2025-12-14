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
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

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

    const stream = await getChatResponse(message, menuItems, reservations);

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

