import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/orders/all${params}`);
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
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
    return <div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link to="/admin" className="btn btn-ghost gap-2 mb-6 hover:bg-base-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>

      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t('admin.orders')}</h1>
        <select
          className="select select-bordered"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="card-title">Order #{order._id.slice(-6)}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Customer:</strong> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`badge ${getStatusColor(order.status)} badge-lg`}>
                    {order.status}
                  </div>
                  <div className="badge badge-outline badge-lg">
                    {order.orderType === 'pickup' ? '🏃 Pickup' : '🚗 Delivery'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>

              <div className="mb-4">
                {order.orderType === 'delivery' ? (
                  <>
                    <p className="text-sm"><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                    <p className="text-sm"><strong>Phone:</strong> {order.phone}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm"><strong>Pickup Order</strong> - Customer will collect from restaurant</p>
                    <p className="text-sm"><strong>Phone:</strong> {order.phone}</p>
                  </>
                )}
                {order.specialInstructions && (
                  <p className="text-sm"><strong>Special Instructions:</strong> {order.specialInstructions}</p>
                )}
              </div>

              <div className="card-actions">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(order._id, 'preparing')}
                    className="btn btn-sm btn-info"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateStatus(order._id, 'ready')}
                    className="btn btn-sm btn-success"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateStatus(order._id, 'delivered')}
                    className="btn btn-sm btn-primary"
                  >
                    Mark Delivered
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => updateStatus(order._id, 'cancelled')}
                    className="btn btn-sm btn-error"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

