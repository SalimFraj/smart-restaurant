import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize WebSocket connection
  useSocket();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

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

  const NavLink = ({ to, children, className = '' }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`btn btn-ghost btn-sm md:btn-md rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-primary/10 hover:text-primary'
          } ${className}`}
        onClick={closeMobileMenu}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <div className="navbar bg-base-100/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-base-300/50 px-2 sm:px-4 lg:px-6">
        {/* NAVBAR START - Logo & Mobile Menu */}
        <div className="navbar-start gap-1">
          {/* Hamburger Menu Button - visible on mobile/tablet */}
          <div className="mobile-menu-container xl:hidden">
            <button
              className="btn btn-ghost btn-circle btn-sm sm:btn-md"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
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
          </div>

          {/* Logo */}
          <Link to="/" className="btn btn-ghost px-2 sm:px-3 hover:scale-105 transition-transform">
            <span className="text-xl sm:text-2xl">🔥</span>
            <span className="gradient-text-sunset font-playfair tracking-wider text-lg sm:text-xl lg:text-2xl font-bold">
              Jr's Grill
            </span>
          </Link>
        </div>

        {/* NAVBAR CENTER - Desktop Navigation (hidden on mobile/tablet) */}
        <div className="navbar-center hidden xl:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li><NavLink to="/">{t('nav.home')}</NavLink></li>
            <li><NavLink to="/menu">{t('nav.menu')}</NavLink></li>
            {user && (
              <>
                <li><NavLink to="/orders">{t('nav.orders')}</NavLink></li>
                <li><NavLink to="/reservations">{t('nav.reservations')}</NavLink></li>
              </>
            )}
            {user?.role === 'admin' && (
              <li>
                <Link
                  to="/admin"
                  className={`btn btn-ghost btn-sm md:btn-md rounded-lg transition-all duration-200 ${location.pathname.startsWith('/admin')
                    ? 'bg-secondary/15 text-secondary font-semibold'
                    : 'hover:bg-secondary/10 hover:text-secondary'
                    }`}
                >
                  {t('nav.admin')}
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* NAVBAR END - Actions */}
        <div className="navbar-end gap-1 sm:gap-2">
          {/* Language Selector - Desktop only */}
          <div className="dropdown dropdown-end hidden lg:block">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm hover:scale-105 transition-transform">
              <span className="text-lg">{i18n.language === 'en' ? '🇺🇸' : i18n.language === 'es' ? '🇪🇸' : '🇫🇷'}</span>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[100] w-36 p-2 shadow-xl border border-base-300 mt-2">
              <li>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`hover:bg-primary/10 rounded-lg text-sm ${i18n.language === 'en' ? 'bg-primary/10 text-primary' : ''}`}
                >
                  🇺🇸 English
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage('es')}
                  className={`hover:bg-primary/10 rounded-lg text-sm ${i18n.language === 'es' ? 'bg-primary/10 text-primary' : ''}`}
                >
                  🇪🇸 Español
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`hover:bg-primary/10 rounded-lg text-sm ${i18n.language === 'fr' ? 'bg-primary/10 text-primary' : ''}`}
                >
                  🇫🇷 Français
                </button>
              </li>
            </ul>
          </div>

          {/* Theme Toggle */}
          <button
            className="btn btn-ghost btn-circle btn-sm sm:btn-md hover:scale-105 transition-transform"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            <span className="text-lg sm:text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          {/* Notification Center - logged in users only */}
          {user && <NotificationCenter />}

          {/* Cart Icon with Reactive Badge */}
          <Link to="/cart" className="btn btn-ghost btn-circle btn-sm sm:btn-md indicator hover:scale-105 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
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
              <span className="badge badge-xs sm:badge-sm badge-primary indicator-item animate-bounce-in font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* User Menu / Auth Buttons */}
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm sm:btn-md rounded-lg hover:bg-primary/10 transition-all px-2 sm:px-3">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8 sm:w-10">
                    <span className="text-xs sm:text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <span className="ml-1 sm:ml-2 hidden md:inline-block font-medium text-sm truncate max-w-[100px]">
                  {user.name}
                </span>
                <svg className="w-4 h-4 ml-1 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[100] w-56 p-2 shadow-xl border border-base-300 mt-2">
                <li className="px-3 py-2 border-b border-base-200">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-base-content/60 truncate">{user.email}</span>
                    {user.role === 'admin' && (
                      <span className="badge badge-secondary badge-xs mt-1">Admin</span>
                    )}
                  </div>
                </li>
                <li className="mt-1">
                  <Link
                    to="/profile"
                    className="hover:bg-primary/10 hover:text-primary rounded-lg text-sm flex items-center gap-2"
                    onClick={closeMobileMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="hover:bg-error/10 hover:text-error rounded-lg text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('nav.logout')}
                  </button>
                </li>
              </ul>
            </div>
          ) : !loading ? (
            <div className="flex gap-1 sm:gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm rounded-lg hover:bg-primary/10 transition-all hidden sm:flex">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all">
                <span className="hidden sm:inline">{t('nav.register')}</span>
                <span className="sm:hidden">Sign Up</span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 xl:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMobileMenu}
      />

      {/* MOBILE MENU SLIDE-IN PANEL */}
      <div
        className={`mobile-menu-container fixed top-[57px] sm:top-[65px] left-0 w-72 sm:w-80 h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] bg-base-100 z-50 xl:hidden transform transition-transform duration-300 ease-out shadow-2xl border-r border-base-300 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <nav className="p-4 space-y-2">
          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-base-content/50 font-semibold px-3 mb-2">
              Navigation
            </p>
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/' ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-base-200'
                }`}
              onClick={closeMobileMenu}
            >
              <span className="text-xl">🏠</span>
              <span>{t('nav.home')}</span>
            </Link>
            <Link
              to="/menu"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/menu' ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-base-200'
                }`}
              onClick={closeMobileMenu}
            >
              <span className="text-xl">🍽️</span>
              <span>{t('nav.menu')}</span>
            </Link>
            {user && (
              <>
                <Link
                  to="/orders"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/orders' ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-base-200'
                    }`}
                  onClick={closeMobileMenu}
                >
                  <span className="text-xl">📋</span>
                  <span>{t('nav.orders')}</span>
                </Link>
                <Link
                  to="/reservations"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/reservations' ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-base-200'
                    }`}
                  onClick={closeMobileMenu}
                >
                  <span className="text-xl">📅</span>
                  <span>{t('nav.reservations')}</span>
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin') ? 'bg-secondary/15 text-secondary font-semibold' : 'hover:bg-base-200'
                  }`}
                onClick={closeMobileMenu}
              >
                <span className="text-xl">👨‍💼</span>
                <span>{t('nav.admin')}</span>
              </Link>
            )}
          </div>

          <div className="divider my-3"></div>

          {/* Auth Section for Mobile */}
          {!user && !loading && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-base-content/50 font-semibold px-3 mb-2">
                Account
              </p>
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-all"
                onClick={closeMobileMenu}
              >
                <span className="text-xl">🔑</span>
                <span>{t('nav.login')}</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all"
                onClick={closeMobileMenu}
              >
                <span className="text-xl">✨</span>
                <span>{t('nav.register')}</span>
              </Link>
              <div className="divider my-3"></div>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-base-content/50 font-semibold px-3 mb-2">
              Language
            </p>
            <button
              onClick={() => {
                changeLanguage('en');
                closeMobileMenu();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all ${i18n.language === 'en' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                }`}
            >
              <span className="text-xl">🇺🇸</span>
              <span>English</span>
              {i18n.language === 'en' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                changeLanguage('es');
                closeMobileMenu();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all ${i18n.language === 'es' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                }`}
            >
              <span className="text-xl">🇪🇸</span>
              <span>Español</span>
              {i18n.language === 'es' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                changeLanguage('fr');
                closeMobileMenu();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all ${i18n.language === 'fr' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                }`}
            >
              <span className="text-xl">🇫🇷</span>
              <span>Français</span>
              {i18n.language === 'fr' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
