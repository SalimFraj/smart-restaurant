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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Back Navigation */}
      <Link to="/admin" className="btn btn-ghost btn-sm sm:btn-md gap-2 mb-4 sm:mb-6 hover:bg-base-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Back</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold">{t('admin.analytics')}</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <select
            className="select select-bordered select-sm sm:select-md flex-1 sm:flex-none"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">7 Days</option>
            <option value="month">30 Days</option>
          </select>
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm sm:btn-md flex-1 sm:flex-none">
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export to CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="stat bg-base-100 shadow-xl rounded-lg p-3 sm:p-6">
          <div className="stat-title text-xs sm:text-sm">Total Revenue</div>
          <div className="stat-value text-primary text-lg sm:text-3xl">${stats.revenue.toFixed(2)}</div>
          <div className="stat-desc text-xs hidden sm:block">Period: {period}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-lg p-3 sm:p-6">
          <div className="stat-title text-xs sm:text-sm">Total Orders</div>
          <div className="stat-value text-secondary text-lg sm:text-3xl">{stats.orderCount}</div>
          <div className="stat-desc text-xs hidden sm:block">Period: {period}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card bg-base-100 shadow-xl p-3 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={200} className="sm:h-[300px]">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card bg-base-100 shadow-xl p-3 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Top 5 Dishes</h2>
          <ResponsiveContainer width="100%" height={200} className="sm:h-[300px]">
            <BarChart data={topDishes} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 9 }} height={80} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip />
              <Bar dataKey="popularity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl p-3 sm:p-6">
        <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Order Status Distribution</h2>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <PieChart>
            <Pie
              data={orderStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="count"
              fontSize={10}
            >
              {orderStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

