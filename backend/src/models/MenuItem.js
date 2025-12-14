import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['appetizer', 'main-course', 'dessert', 'beverage', 'salad', 'soup']
  },
  image: {
    type: String,
    default: ''
  },
  cloudinaryId: {
    type: String,
    default: ''
  },
  dietary: {
    vegan: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false }
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  available: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Standard indexes
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ available: 1 });
menuItemSchema.index({ popularity: -1 });

// Text index for efficient search on name, description, and ingredients
menuItemSchema.index({
  name: 'text',
  description: 'text',
  ingredients: 'text'
}, {
  weights: {
    name: 10,
    description: 5,
    ingredients: 1
  },
  name: 'MenuItemTextIndex'
});

export default mongoose.model('MenuItem', menuItemSchema);

