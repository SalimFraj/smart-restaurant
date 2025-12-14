import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '../store';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  const [orderType, setOrderType] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order placed successfully! 🎉');
      clearCart();
      navigate('/orders');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });

  const handleCheckout = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Custom validation
    if (orderType === 'delivery' && (!deliveryAddress || deliveryAddress.trim() === '')) {
      toast.error('Please enter your delivery address');
      return;
    }

    if (!phone || phone.trim() === '') {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const orderData = {
      items: items.map(item => ({
        menuItem: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      phone,
      specialInstructions,
    };

    createOrderMutation.mutate(orderData);
  };


  if (items.length === 0) {
    return (
      <motion.div
        className="min-h-screen bg-base-200 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <span className="text-9xl">🛒</span>
          </motion.div>
          <h2 className="text-3xl font-bold mt-8 mb-4">Your cart is empty</h2>
          <p className="text-base-content/70 mb-8">Add some delicious items to get started!</p>
          <button
            onClick={() => navigate('/menu')}
            className="btn btn-primary btn-lg"
          >
            Browse Menu
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-base-200 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-4xl font-bold gradient-text mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Shopping Cart ({getItemCount()} items)
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-base-100 shadow-xl"
              >
                <div className="card-body">
                  <div className="flex gap-4">
                    <img
                      loading="lazy"
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="card-title">{item.name}</h3>
                      <p className="text-base-content/70 text-sm">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {item.isVegan && <span className="badge badge-success badge-sm">🌱 Vegan</span>}
                        {item.isVegetarian && <span className="badge badge-info badge-sm">🥗 Veg</span>}
                        {item.isGlutenFree && <span className="badge badge-warning badge-sm">🌾 GF</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        ✕
                      </button>
                      <p className="text-2xl font-bold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="join">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="btn btn-sm join-item"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <div className="join-item btn btn-sm pointer-events-none">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="btn btn-sm join-item"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-100 shadow-xl sticky top-24"
            >
              <div className="card-body">
                <h2 className="card-title mb-4">Order Summary</h2>

                <form onSubmit={handleCheckout} noValidate>
                  {/* Order Type Selection */}
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text font-semibold">Order Type *</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="label cursor-pointer flex-1 bg-base-200 rounded-lg p-3 border-2 border-transparent hover:border-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="orderType"
                            className="radio radio-primary"
                            value="delivery"
                            checked={orderType === 'delivery'}
                            onChange={(e) => setOrderType(e.target.value)}
                          />
                          <span className="label-text font-medium">🚗 Delivery</span>
                        </div>
                      </label>
                      <label className="label cursor-pointer flex-1 bg-base-200 rounded-lg p-3 border-2 border-transparent hover:border-primary transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="orderType"
                            className="radio radio-primary"
                            value="pickup"
                            checked={orderType === 'pickup'}
                            onChange={(e) => setOrderType(e.target.value)}
                          />
                          <span className="label-text font-medium">🏃 Pickup</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Delivery Address - Only shown for delivery orders */}
                  {orderType === 'delivery' && (
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text font-semibold">Delivery Address *</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered"
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text font-semibold">Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      className="input input-bordered"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text font-semibold">Special Instructions</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      placeholder="Any special requests? (optional)"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="divider"></div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-base-content/70">
                      <span>Subtotal</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base-content/70">
                      <span>Delivery Fee</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between text-base-content/70">
                      <span>Tax (10%)</span>
                      <span>${(getTotal() * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ${(getTotal() + 5 + getTotal() * 0.1).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="btn btn-primary w-full"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/menu')}
                    className="btn btn-ghost w-full mt-2"
                  >
                    Continue Shopping
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
