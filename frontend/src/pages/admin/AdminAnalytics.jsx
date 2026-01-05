import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminAnalytics() {
  const [revenueData, setRevenueData] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0 });
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Revenue stats
      const revenueRes = await api.get(`/analytics/revenue?period=${period}`);
      setStats(revenueRes.data.data);

      // Revenue chart
      const chartRes = await api.get(`/analytics/revenue-chart?period=${period}`);
      setRevenueData(chartRes.data.data);

      // Top dishes
      const dishesRes = await api.get('/analytics/top-dishes');
      setTopDishes(dishesRes.data.data);

      // Order status
      const statusRes = await api.get('/analytics/order-status');
      setOrderStatus(statusRes.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/analytics/export-csv', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
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
        <h1 className="text-4xl font-bold">{t('admin.analytics')}</h1>
        <div className="flex gap-4">
          <select
            className="select select-bordered"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button onClick={handleExportCSV} className="btn btn-primary">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="stat bg-base-100 shadow-xl rounded-lg p-6">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-primary">${stats.revenue.toFixed(2)}</div>
          <div className="stat-desc">Period: {period}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-lg p-6">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value text-secondary">{stats.orderCount}</div>
          <div className="stat-desc">Period: {period}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Top 5 Dishes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topDishes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="popularity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Order Status Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={orderStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {orderStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

