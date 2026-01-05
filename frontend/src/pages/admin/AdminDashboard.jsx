import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Link to="/admin/menu" className="card bg-base-100 shadow-xl hover:shadow-2xl transition active:scale-95">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-sm sm:text-lg">🍽️ <span className="hidden sm:inline">{t('admin.menu')}</span><span className="sm:hidden">Menu</span></h2>
            <p className="text-xs sm:text-sm hidden sm:block">Manage menu items, add new dishes, update prices</p>
          </div>
        </Link>

        <Link to="/admin/orders" className="card bg-base-100 shadow-xl hover:shadow-2xl transition active:scale-95">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-sm sm:text-lg">📦 <span className="hidden sm:inline">{t('admin.orders')}</span><span className="sm:hidden">Orders</span></h2>
            <p className="text-xs sm:text-sm hidden sm:block">View and manage all orders, update status</p>
          </div>
        </Link>

        <Link to="/admin/reservations" className="card bg-base-100 shadow-xl hover:shadow-2xl transition active:scale-95">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-sm sm:text-lg">📅 <span className="hidden sm:inline">{t('admin.reservations')}</span><span className="sm:hidden">Reserve</span></h2>
            <p className="text-xs sm:text-sm hidden sm:block">Manage table reservations, approve or reject</p>
          </div>
        </Link>

        <Link to="/admin/analytics" className="card bg-base-100 shadow-xl hover:shadow-2xl transition active:scale-95">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-sm sm:text-lg">📊 <span className="hidden sm:inline">{t('admin.analytics')}</span><span className="sm:hidden">Stats</span></h2>
            <p className="text-xs sm:text-sm hidden sm:block">View revenue charts, top dishes, order statistics</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
