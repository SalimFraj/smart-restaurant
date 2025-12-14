import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartStore, useUIStore } from '../store';
import { useSocket } from '../hooks/useSocket';
import { useTranslation } from 'react-i18next';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const items = useCartStore((state) => state.items);
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize WebSocket connection
  useSocket();

  // Calculate cart count from items - this ensures reactivity
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="navbar bg-base-100/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-base-300/50">
      <div className="navbar-start">
        {/* Hamburger Menu Button - visible on mobile/tablet */}
        <div className="dropdown lg:hidden">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          {mobileMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[100] p-3 shadow-xl bg-base-100 rounded-box w-56 border border-base-300"
            >
              <li>
                <Link
                  to="/"
                  className="py-3 hover:bg-primary/10 hover:text-primary rounded-lg"
                  onClick={closeMobileMenu}
                >
                  🏠 {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="py-3 hover:bg-primary/10 hover:text-primary rounded-lg"
                  onClick={closeMobileMenu}
                >
                  🍽️ {t('nav.menu')}
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link
                      to="/orders"
                      className="py-3 hover:bg-primary/10 hover:text-primary rounded-lg"
                      onClick={closeMobileMenu}
                    >
                      📋 {t('nav.orders')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reservations"
                      className="py-3 hover:bg-primary/10 hover:text-primary rounded-lg"
                      onClick={closeMobileMenu}
                    >
                      📅 {t('nav.reservations')}
                    </Link>
                  </li>
                </>
              )}
              {user?.role === 'admin' && (
                <li>
                  <Link
                    to="/admin"
                    className="py-3 hover:bg-secondary/10 hover:text-secondary rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    👨‍💼 {t('nav.admin')}
                  </Link>
                </li>
              )}
              <div className="divider my-1"></div>
              {!user && !loading && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="py-3 hover:bg-primary/10 hover:text-primary rounded-lg"
                      onClick={closeMobileMenu}
                    >
                      🔑 {t('nav.login')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium"
                      onClick={closeMobileMenu}
                    >
                      ✨ {t('nav.register')}
                    </Link>
                  </li>
                </>
              )}
              <div className="divider my-1"></div>
              <li className="menu-title">
                <span className="text-xs uppercase tracking-wider text-base-content/50">Language</span>
              </li>
              <li>
                <button
                  onClick={() => {
                    changeLanguage('en');
                    closeMobileMenu();
                  }}
                  className={`py-2 hover:bg-primary/10 rounded-lg ${i18n.language === 'en' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                >
                  🇺🇸 English
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    changeLanguage('es');
                    closeMobileMenu();
                  }}
                  className={`py-2 hover:bg-primary/10 rounded-lg ${i18n.language === 'es' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                >
                  🇪🇸 Español
                </button>
              </li>
            </ul>
          )}
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold hover-scale transition-transform">
          <span className="text-2xl mr-2">🔥</span>
          <span className="gradient-text-sunset font-playfair tracking-wider text-2xl">Jr's Grill</span>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li>
            <Link to="/" className="btn btn-ghost rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
              {t('nav.home')}
            </Link>
          </li>
          <li>
            <Link to="/menu" className="btn btn-ghost rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
              {t('nav.menu')}
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/orders" className="btn btn-ghost rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                  {t('nav.orders')}
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="btn btn-ghost rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                  {t('nav.reservations')}
                </Link>
              </li>
            </>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="btn btn-ghost rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all">
                {t('nav.admin')}
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-end gap-2">
        <div className="dropdown dropdown-end hidden lg:block">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover-scale transition-transform">
            <span className="text-xl">{i18n.language === 'en' ? '🇺🇸' : '🇪🇸'}</span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-xl border border-base-300">
            <li>
              <button onClick={() => changeLanguage('en')} className="hover:bg-primary/10 rounded-lg">
                🇺🇸 English
              </button>
            </li>
            <li>
              <button onClick={() => changeLanguage('es')} className="hover:bg-primary/10 rounded-lg">
                🇪🇸 Español
              </button>
            </li>
          </ul>
        </div>

        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-circle hover-scale transition-transform"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <span className="text-xl">🌙</span>
          ) : (
            <span className="text-xl">☀️</span>
          )}
        </button>

        {/* Notification Center */}
        {user && <NotificationCenter />}

        {/* Cart Icon with Reactive Badge */}
        <Link to="/cart" className="btn btn-ghost btn-circle indicator hover-scale transition-transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {cartCount > 0 && (
            <span className="badge badge-sm badge-primary indicator-item animate-bounce-in">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost rounded-lg hover:bg-primary/10 transition-all">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <span className="ml-2 hidden sm:inline-block font-medium">{user.name}</span>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-xl border border-base-300 mt-2">
              <li className="">
                <span className="text-sm text-base-content/70 truncate max-w-full block">{user.email}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="hover:bg-error/10 hover:text-error rounded-lg">
                  {t('nav.logout')}
                </button>
              </li>
            </ul>
          </div>
        ) : !loading ? (
          <>
            <Link to="/login" className="btn btn-ghost rounded-lg hover:bg-primary/10 transition-all">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="btn btn-primary rounded-lg shadow-lg hover:shadow-xl hover-scale transition-all">
              {t('nav.register')}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
