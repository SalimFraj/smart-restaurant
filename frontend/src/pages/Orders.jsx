import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      preparing: 'badge-info',
      ready: 'badge-success',
      delivered: 'badge-primary',
      cancelled: 'badge-error'
    };
    return colors[status] || 'badge-ghost';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-base-content/70">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold mb-2 gradient-text">{t('orders.title')}</h1>
        <p className="text-lg text-base-content/70">Track and manage all your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6 animate-bounce">📦</div>
          <h2 className="text-3xl font-bold mb-4">No orders yet</h2>
          <p className="text-xl text-base-content/70 mb-8">Start ordering delicious food from our menu!</p>
          <a href="/menu" className="btn btn-primary btn-lg px-8 shadow-xl hover:scale-105 transition-transform">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Browse Menu
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => (
            <div
              key={order._id}
              className="card bg-base-100 shadow-xl card-hover animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="card-body p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div>
                        <h2 className="card-title text-2xl">Order #{order._id.slice(-6).toUpperCase()}</h2>
                        <p className="text-sm text-base-content/70 flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`badge ${getStatusColor(order.status)} badge-lg shadow-lg capitalize`}>
                      {order.status}
                    </div>
                    <div className="badge badge-outline badge-lg">
                      {order.orderType === 'pickup' ? '🏃 Pickup' : '🚗 Delivery'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex justify-between items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">{item.name}</span>
                        <span className="badge badge-ghost">x{item.quantity}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
                  {order.orderType === 'delivery' ? (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-base-content/50 mb-1">Delivery Address</p>
                        <p className="text-sm font-medium">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <div>
                        <p className="text-xs text-base-content/50 mb-1">Pickup Order</p>
                        <p className="text-sm font-medium">Collect from restaurant</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-base-content/50 mb-1">Phone</p>
                      <p className="text-sm font-medium">{order.phone}</p>
                    </div>
                  </div>
                  {order.specialInstructions && (
                    <div className="md:col-span-2 flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-base-content/50 mb-1">Special Instructions</p>
                        <p className="text-sm font-medium">{order.specialInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

