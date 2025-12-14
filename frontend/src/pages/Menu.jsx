import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCartStore, useUIStore, useFavoritesStore } from '../store';
import api from '../services/api';

export default function Menu() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const { menuView, setMenuView } = useUIStore();
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const [sortBy, setSortBy] = useState('name');

  // Fetch menu items with React Query
  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const response = await api.get('/menu');
      return response.data.data;
    },
  });

  // Fetch AI recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await api.post('/ai/recommend');
      return response.data.data || [];
    },
    enabled: !!user,
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ['all', ...Array.from(cats)];
  }, [menuItems]);

  // Filter and sort menu items
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);

    // Dietary filters
    if (dietaryFilters.length > 0) {
      filtered = filtered.filter(item => {
        return dietaryFilters.every(filter => {
          // Check if item.dietary exists and has the property
          if (!item.dietary) return false;
          if (filter === 'vegan') return item.dietary.vegan;
          if (filter === 'vegetarian') return item.dietary.vegetarian;
          if (filter === 'glutenFree') return item.dietary.glutenFree;
          if (filter === 'spicy') return item.dietary.spicy;
          return true;
        });
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'popular') return (b.popularity || 0) - (a.popularity || 0);
      return 0;
    });

    return filtered;
  }, [menuItems, searchQuery, selectedCategory, priceRange, dietaryFilters, sortBy]);

  const handleAddToCart = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  const toggleDietaryFilter = (filter) => {
    setDietaryFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Error loading menu items. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-base-200 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-bold gradient-text mb-4">Our Menu</h1>
          <p className="text-lg text-base-content/70">Discover our delicious selection of dishes</p>
        </motion.div>

        {/* AI Recommendations */}
        {user && recommendations.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="card glass shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="card-title gradient-text">AI Recommendations for You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors">
                      <img
                        loading="lazy"
                        src={item.image || '/placeholder-food.png'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => { e.target.src = '/placeholder-food.png'; }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-base-content/60">${item.price}</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn btn-sm btn-primary"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Controls */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Search</span>
                </label>
                <input
                  type="text"
                  placeholder="Search dishes..."
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Sort By</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">View</span>
                </label>
                <div className="join w-full">
                  <button
                    className={`btn join-item flex-1 ${menuView === 'grid' ? 'btn-primary' : ''}`}
                    onClick={() => setMenuView('grid')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </button>
                  <button
                    className={`btn join-item flex-1 ${menuView === 'list' ? 'btn-primary' : ''}`}
                    onClick={() => setMenuView('list')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Dietary Filters */}
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-semibold">Dietary Preferences</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'vegan', label: '🌱 Vegan', color: 'success' },
                  { key: 'vegetarian', label: '🥗 Vegetarian', color: 'info' },
                  { key: 'glutenFree', label: '🌾 Gluten-Free', color: 'warning' },
                  { key: 'spicy', label: '🌶️ Spicy', color: 'error' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    className={`btn btn-sm ${dietaryFilters.includes(filter.key) ? `btn-${filter.color}` : 'btn-outline'}`}
                    onClick={() => toggleDietaryFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-semibold">Price Range: ${priceRange[0]} - ${priceRange[1]}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="range range-primary"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-base-content/70">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
          {(searchQuery || selectedCategory !== 'all' || dietaryFilters.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDietaryFilters([]);
                setPriceRange([0, 100]);
              }}
              className="btn btn-sm btn-ghost"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl skeleton h-96"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-base-content/50 mb-4">No items found</p>
            <p className="text-base-content/70">Try adjusting your filters</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={menuView}
              className={menuView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {menuView === 'grid' ? (
                    <div className="card bg-base-100 shadow-xl hover-lift">
                      <figure className="relative h-48">
                        <img
                          loading="lazy"
                          src={item.image || '/placeholder-food.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder-food.png'; }}
                        />
                        <button
                          onClick={() => toggleFavorite(item._id)}
                          className="absolute top-2 right-2 btn btn-circle btn-sm glass"
                        >
                          {isFavorite(item._id) ? '❤️' : '🤍'}
                        </button>
                      </figure>
                      <div className="card-body flex flex-col justify-between min-h-[220px]">
                        <div>
                          <h2 className="card-title mb-2">{item.name}</h2>
                          <p className="text-base-content/70 text-sm line-clamp-2 mb-3">{item.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.dietary?.vegan && <span className="badge badge-success badge-sm">🌱 Vegan</span>}
                            {item.dietary?.vegetarian && <span className="badge badge-info badge-sm">🥗 Veg</span>}
                            {item.dietary?.glutenFree && <span className="badge badge-warning badge-sm">🌾 GF</span>}
                            {item.dietary?.spicy && <span className="badge badge-error badge-sm">🌶️ Spicy</span>}
                          </div>
                        </div>
                        <div className="card-actions justify-between items-center mt-4">
                          <span className="text-2xl font-bold text-primary">${item.price}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="btn btn-primary btn-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card card-side bg-base-100 shadow-xl hover-lift">
                      <figure className="w-48 h-full">
                        <img
                          loading="lazy"
                          src={item.image || '/placeholder-food.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/placeholder-food.png'; }}
                        />
                      </figure>
                      <div className="card-body flex-row justify-between">
                        <div className="flex-1">
                          <h2 className="card-title mb-2">{item.name}</h2>
                          <p className="text-base-content/70 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.dietary?.vegan && <span className="badge badge-success badge-sm">🌱 Vegan</span>}
                            {item.dietary?.vegetarian && <span className="badge badge-info badge-sm">🥗 Vegetarian</span>}
                            {item.dietary?.glutenFree && <span className="badge badge-warning badge-sm">🌾 Gluten-Free</span>}
                            {item.dietary?.spicy && <span className="badge badge-error badge-sm">🌶️ Spicy</span>}
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end">
                          <button
                            onClick={() => toggleFavorite(item._id)}
                            className="btn btn-circle btn-sm btn-ghost"
                          >
                            {isFavorite(item._id) ? '❤️' : '🤍'}
                          </button>
                          <span className="text-2xl font-bold text-primary">${item.price}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="btn btn-primary"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
