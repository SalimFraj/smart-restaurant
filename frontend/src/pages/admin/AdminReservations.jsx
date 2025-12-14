import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { t } = useTranslation();

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
    try {
      await api.put(`/reservations/${reservationId}/status`, { status: newStatus });
      toast.success('Reservation status updated');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update reservation status');
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
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Link to="/admin" className="btn btn-ghost gap-2 mb-6 hover:bg-base-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t('admin.reservations')}</h1>
        <div className="flex gap-4">
          <input
            type="date"
            className="input input-bordered"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            className="select select-bordered"
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
        {reservations.map(reservation => (
          <div key={reservation._id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="card-title">
                    {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                  </p>
                  <p className="text-sm">
                    <strong>Customer:</strong> {reservation.user?.name || 'N/A'} ({reservation.user?.email || reservation.contactEmail})
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className={`badge ${getStatusColor(reservation.status)} badge-lg`}>
                    {reservation.status}
                  </div>
                  {reservation.eventType && reservation.eventType !== 'regular' && (
                    <div className="badge badge-secondary badge-lg">
                      {reservation.eventType === 'birthday' && '🎂 Birthday'}
                      {reservation.eventType === 'corporate' && '💼 Corporate'}
                      {reservation.eventType === 'anniversary' && '💐 Anniversary'}
                      {reservation.eventType === 'other' && '✨ Special Event'}
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
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(reservation._id, 'rejected')}
                      className="btn btn-sm btn-error"
                    >
                      Reject
                    </button>
                  </>
                )}
                {reservation.status === 'approved' && (
                  <button
                    onClick={() => updateStatus(reservation._id, 'completed')}
                    className="btn btn-sm btn-primary"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {reservations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl">No reservations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

