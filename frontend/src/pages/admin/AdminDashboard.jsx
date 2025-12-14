import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/menu" className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
          <div className="card-body">
            <h2 className="card-title">🍽️ {t('admin.menu')}</h2>
            <p>Manage menu items, add new dishes, update prices</p>
          </div>
        </Link>

        <Link to="/admin/orders" className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
          <div className="card-body">
            <h2 className="card-title">📦 {t('admin.orders')}</h2>
            <p>View and manage all orders, update status</p>
          </div>
        </Link>

        <Link to="/admin/reservations" className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
          <div className="card-body">
            <h2 className="card-title">📅 {t('admin.reservations')}</h2>
            <p>Manage table reservations, approve or reject</p>
          </div>
        </Link>

        <Link to="/admin/analytics" className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
          <div className="card-body">
            <h2 className="card-title">📊 {t('admin.analytics')}</h2>
            <p>View revenue charts, top dishes, order statistics</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

