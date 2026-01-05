import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // Default: newest first
  const [actionLoading, setActionLoading] = useState(null); // Track which action is in progress
  const { t } = useTranslation();

  // Sort reservations based on selected option
  const sortedReservations = useMemo(() => {
    const sorted = [...reservations];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'guests-desc':
        return sorted.sort((a, b) => b.guests - a.guests);
      case 'guests-asc':
        return sorted.sort((a, b) => a.guests - b.guests);
      case 'status':
        const statusOrder = { pending: 0, approved: 1, completed: 2, rejected: 3, cancelled: 4 };
        return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      default:
        return sorted;
    }
  }, [reservations, sortBy]);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, dateFilter]);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      const response = await api.get(`/reservations/all?${params.toString()}`);
      setReservations(response.data.data);
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reservationId, newStatus) => {
    // Prevent duplicate requests
    if (actionLoading) return;

    const actionKey = `${reservationId}-${newStatus}`;
    setActionLoading(actionKey);

    try {
      await api.put(`/reservations/${reservationId}/status`, { status: newStatus });
      toast.success('Reservation status updated');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-error',
      completed: 'badge-primary',
      cancelled: 'badge-ghost'
    };
    return colors[status] || 'badge-ghost';
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

      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold">{t('admin.reservations')}</h1>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {/* Sort Dropdown */}
          <select
            className="select select-bordered select-sm sm:select-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">📅 Newest</option>
            <option value="oldest">📅 Oldest</option>
            <option value="date-desc">🗓️ Latest Date</option>
            <option value="date-asc">🗓️ Earliest Date</option>
            <option value="guests-desc">👥 Most Guests</option>
            <option value="guests-asc">👥 Fewest Guests</option>
            <option value="status">📊 By Status</option>
          </select>
          <input
            type="date"
            className="input input-bordered input-sm sm:input-md"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            className="select select-bordered select-sm sm:select-md col-span-2 sm:col-span-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedReservations.map(reservation => (
          <div key={reservation._id} className="card bg-base-100 shadow-xl">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="card-title text-base sm:text-lg">
                    {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                  </p>
                  <p className="text-xs sm:text-sm mt-1 truncate max-w-[250px] sm:max-w-none">
                    <strong>Customer:</strong> {reservation.user?.name || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className={`badge ${getStatusColor(reservation.status)} badge-sm sm:badge-lg capitalize`}>
                    {reservation.status}
                  </div>
                  {reservation.eventType && reservation.eventType !== 'regular' && (
                    <div className="badge badge-secondary badge-sm sm:badge-lg">
                      {reservation.eventType === 'birthday' && '🎂 Birthday'}
                      {reservation.eventType === 'corporate' && '💼 Corporate'}
                      {reservation.eventType === 'anniversary' && '💐 Anniversary'}
                      {reservation.eventType === 'other' && '✨ Special'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm"><strong>Contact:</strong> {reservation.contactPhone} | {reservation.contactEmail}</p>
                {reservation.eventDetails && (
                  <p className="text-sm mt-2 bg-secondary/10 p-2 rounded"><strong>Event Details:</strong> {reservation.eventDetails}</p>
                )}
                {reservation.specialRequests && (
                  <p className="text-sm mt-2"><strong>Special Requests:</strong> {reservation.specialRequests}</p>
                )}
              </div>

              <div className="card-actions">
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(reservation._id, 'approved')}
                      className="btn btn-sm btn-success"
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === `${reservation._id}-approved` ? (
                        <><span className="loading loading-spinner loading-xs"></span> Approving...</>
                      ) : (
                        'Approve'
                      )}
                    </button>
                    <button
                      onClick={() => updateStatus(reservation._id, 'rejected')}
                      className="btn btn-sm btn-error"
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === `${reservation._id}-rejected` ? (
                        <><span className="loading loading-spinner loading-xs"></span> Rejecting...</>
                      ) : (
                        'Reject'
                      )}
                    </button>
                  </>
                )}
                {reservation.status === 'approved' && (
                  <button
                    onClick={() => updateStatus(reservation._id, 'completed')}
                    className="btn btn-sm btn-primary"
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === `${reservation._id}-completed` ? (
                      <><span className="loading loading-spinner loading-xs"></span> Completing...</>
                    ) : (
                      'Mark Completed'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {sortedReservations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl">No reservations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

