import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useUIStore } from './store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReservations from './pages/admin/AdminReservations';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import Chatbot from './components/Chatbot';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Create a client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 animate-pulse">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 animate-pulse">Loading...</p>
      </div>
    </div>
  );
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/reservations" element={<PrivateRoute><Reservations /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/menu" element={<AdminRoute><AdminMenu /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/reservations" element={<AdminRoute><AdminReservations /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const initTheme = useUIStore((state) => state.initTheme);

  // Initialize theme on app mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-base-200 overflow-x-hidden">
          <Navbar />
          <AnimatedRoutes />
          <Chatbot />
          <PWAInstallPrompt />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'transparent',
                boxShadow: 'none',
                padding: 0,
              },
              className: '',
              success: {
                duration: 3000,
              },
              error: {
                duration: 4000,
              },
            }}
            containerStyle={{
              top: 80,
            }}
          >
            {(t) => (
              <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full glass shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
                style={{
                  animation: t.visible
                    ? 'toast-enter 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards'
                    : 'toast-exit 0.2s ease-in forwards'
                }}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {t.type === 'success' && (
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {t.type === 'error' && (
                        <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {t.type === 'loading' && (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="loading loading-spinner loading-sm text-primary"></span>
                        </div>
                      )}
                      {!t.type && (
                        <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-base-content">
                        {t.type === 'success' && 'Success'}
                        {t.type === 'error' && 'Error'}
                        {t.type === 'loading' && 'Loading...'}
                        {!t.type && 'Info'}
                      </p>
                      <p className="mt-1 text-sm text-base-content/70">
                        {t.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-base-300">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-200/50 focus:outline-none transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </Toaster>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
