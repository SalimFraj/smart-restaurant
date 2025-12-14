import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const menuItems = [
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, parmesan cheese, and croutons',
    price: 12.99,
    category: 'salad',
    dietary: { vegetarian: true, glutenFree: false },
    ingredients: ['Romaine lettuce', 'Caesar dressing', 'Parmesan cheese', 'Croutons'],
    image: '/menu/caesar_salad.png',
    popularity: 45
  },
  {
    name: 'Bruschetta',
    description: 'Toasted bread topped with fresh tomatoes, basil, and mozzarella',
    price: 10.99,
    category: 'appetizer',
    dietary: { vegetarian: true, glutenFree: false },
    ingredients: ['Bread', 'Tomatoes', 'Basil', 'Mozzarella', 'Olive oil'],
    image: '/menu/bruschetta.png',
    popularity: 50
  },
  {
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings with blue cheese dip',
    price: 13.99,
    category: 'appetizer',
    dietary: { spicy: true, glutenFree: false },
    ingredients: ['Chicken wings', 'Buffalo sauce', 'Blue cheese'],
    image: '/menu/chicken_wings.png',
    popularity: 60
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon grilled to perfection with lemon butter sauce',
    price: 24.99,
    category: 'main-course',
    dietary: { glutenFree: true },
    ingredients: ['Salmon', 'Lemon', 'Butter', 'Herbs'],
    image: '/menu/grilled_salmon.png',
    popularity: 70
  },
  {
    name: 'Ribeye Steak',
    description: '12oz prime ribeye steak with garlic mashed potatoes and vegetables',
    price: 32.99,
    category: 'main-course',
    dietary: { glutenFree: true },
    ingredients: ['Ribeye steak', 'Potatoes', 'Garlic', 'Vegetables'],
    image: '/menu/ribeye_steak.png',
    popularity: 75
  },
  {
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with marinara sauce and melted mozzarella',
    price: 18.99,
    category: 'main-course',
    dietary: { glutenFree: false },
    ingredients: ['Chicken breast', 'Breadcrumbs', 'Marinara', 'Mozzarella', 'Pasta'],
    image: '/menu/chicken_parmesan.png',
    popularity: 68
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil',
    price: 14.99,
    category: 'main-course',
    dietary: { vegetarian: true, glutenFree: false },
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Basil'],
    image: '/menu/margherita_pizza.png',
    popularity: 80
  },
  {
    name: 'Garden Fresh Salad',
    description: 'Mixed greens, cherry tomatoes, cucumbers, carrots, and balsamic vinaigrette',
    price: 11.99,
    category: 'salad',
    dietary: { vegan: true, vegetarian: true, glutenFree: true },
    ingredients: ['Mixed greens', 'Cherry tomatoes', 'Cucumbers', 'Carrots', 'Balsamic vinaigrette'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    popularity: 38
  },
  {
    name: 'Tomato Basil Soup',
    description: 'Creamy tomato soup with fresh basil and a hint of garlic',
    price: 8.99,
    category: 'soup',
    dietary: { vegetarian: true, glutenFree: true },
    ingredients: ['Tomatoes', 'Basil', 'Garlic', 'Cream', 'Olive oil'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    popularity: 42
  },
  {
    name: 'French Onion Soup',
    description: 'Classic French onion soup with caramelized onions and melted cheese',
    price: 9.99,
    category: 'soup',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    popularity: 65
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 8.99,
    category: 'dessert',
    dietary: { vegetarian: true, glutenFree: false },
    ingredients: ['Chocolate', 'Flour', 'Eggs', 'Butter', 'Vanilla ice cream'],
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    popularity: 85
  },
  {
    name: 'New York Cheesecake',
    description: 'Creamy New York-style cheesecake with berry compote',
    price: 9.99,
    category: 'dessert',
    dietary: { vegetarian: true, glutenFree: false },
    ingredients: ['Cream cheese', 'Graham crackers', 'Eggs', 'Sugar', 'Berries'],
    image: 'https://images.unsplash.com/photo-1524351199676-9423600dbe1b?w=400',
    popularity: 72
  },
  {
    name: 'Vegan Chocolate Mousse',
    description: 'Rich and creamy chocolate mousse made with avocado and coconut',
    price: 7.99,
    category: 'dessert',
    dietary: { vegan: true, vegetarian: true, glutenFree: true },
    ingredients: ['Avocado', 'Coconut cream', 'Cocoa powder', 'Maple syrup'],
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4cbc6feb?w=400',
    popularity: 38
  },
  {
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemonade with a hint of mint',
    price: 4.99,
    category: 'beverage',
    dietary: { vegan: true, vegetarian: true, glutenFree: true },
    ingredients: ['Lemons', 'Sugar', 'Water', 'Mint'],
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2fdc?w=400',
    popularity: 55
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee served over ice with cream and sugar',
    price: 5.99,
    category: 'beverage',
    dietary: { vegetarian: true, glutenFree: true },
    ingredients: ['Coffee', 'Ice', 'Cream', 'Sugar'],
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
    popularity: 62
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.49,
    category: 'beverage',
    dietary: { vegan: true, vegetarian: true, glutenFree: true },
    ingredients: ['Oranges'],
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    popularity: 48
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-restaurant');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartrestaurant.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('👤 Created admin user:', admin.email);

    // Create menu items
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`🍽️  Created ${createdItems.length} menu items`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@smartrestaurant.com');
    console.log('Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

