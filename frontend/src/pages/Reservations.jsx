import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 1,
    specialRequests: '',
    contactPhone: '',
    contactEmail: '',
    eventType: 'regular',
    eventDetails: ''
  });
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    fetchReservations();
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactEmail: user.email || ''
      }));
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations/my-reservations');
      setReservations(response.data.data);
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', formData);
      toast.success('Reservation created successfully!');
      setShowForm(false);
      setFormData({
        date: '',
        time: '',
        guests: 1,
        specialRequests: '',
        contactPhone: '',
        contactEmail: user?.email || '',
        eventType: 'regular',
        eventDetails: ''
      });
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
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
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-base-content/70">Loading your reservations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-extrabold mb-2 gradient-text">{t('reservations.title')}</h1>
          <p className="text-lg text-base-content/70">Book and manage your table reservations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary btn-lg shadow-xl hover:scale-105 transition-transform"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Reservation
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow-2xl mb-8 animate-scale-in glass-effect">
          <div className="card-body p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="card-title text-3xl">Create Reservation</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Date *</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      className="input input-bordered w-full pl-10 rounded-lg focus:input-primary"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Time *</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time"
                      className="input input-bordered w-full pl-10 rounded-lg focus:input-primary"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Number of Guests *</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <input
                      type="number"
                      className="input input-bordered w-full pl-10 rounded-lg focus:input-primary"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Contact Phone *</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      className="input input-bordered w-full pl-10 rounded-lg focus:input-primary"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Contact Email *</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input
                      type="email"
                      className="input input-bordered w-full pl-10 rounded-lg focus:input-primary"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Event Type *</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <select
                      className="select select-bordered w-full pl-10 rounded-lg focus:select-primary"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    >
                      <option value="regular">🍽️ Regular Table</option>
                      <option value="birthday">🎂 Birthday Party</option>
                      <option value="corporate">💼 Corporate Event</option>
                      <option value="anniversary">💐 Anniversary</option>
                      <option value="other">✨ Other Special Event</option>
                    </select>
                  </div>
                </div>

                {/* Event Details - Only shown for non-regular events */}
                {formData.eventType !== 'regular' && (
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text font-semibold">
                        {formData.eventType === 'other' ? 'Describe Your Event *' : 'Event Details'}
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered rounded-lg focus:textarea-primary"
                      value={formData.eventDetails}
                      onChange={(e) => setFormData({ ...formData, eventDetails: e.target.value })}
                      placeholder={
                        formData.eventType === 'other'
                          ? 'Please describe your special event...'
                          : formData.eventType === 'birthday'
                            ? 'E.g., Birthday cake needed, decorations, number of guests...'
                            : formData.eventType === 'corporate'
                              ? 'E.g., Presentation setup, AV requirements, menu preferences...'
                              : 'Any special requirements or details for this event...'
                      }
                      rows={3}
                    />
                  </div>
                )}

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Special Requests</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered rounded-lg focus:textarea-primary"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Any special requests or dietary requirements?"
                    rows={4}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6 animate-bounce">📅</div>
          <h2 className="text-3xl font-bold mb-4">No reservations yet</h2>
          <p className="text-xl text-base-content/70 mb-8">Book your table and enjoy a great dining experience!</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-lg px-8 shadow-xl hover:scale-105 transition-transform"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Make Your First Reservation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map((reservation, idx) => (
            <div
              key={reservation._id}
              className="card bg-base-100 shadow-xl card-hover animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="card-body p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <span className="text-3xl">📅</span>
                    </div>
                    <div>
                      <h2 className="card-title text-2xl mb-2">
                        {new Date(reservation.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h2>
                      <div className="flex items-center gap-4 text-base-content/70">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">{reservation.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`badge ${getStatusColor(reservation.status)} badge-lg shadow-lg capitalize`}>
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

                <div className="divider"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-base-content/50 mb-1">Phone</p>
                      <p className="text-sm font-medium">{reservation.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <div>
                      <p className="text-xs text-base-content/50 mb-1">Email</p>
                      <p className="text-sm font-medium">{reservation.contactEmail}</p>
                    </div>
                  </div>
                  {reservation.specialRequests && (
                    <div className="md:col-span-2 flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-base-content/50 mb-1">Special Requests</p>
                        <p className="text-sm font-medium">{reservation.specialRequests}</p>
                      </div>
                    </div>
                  )}
                  {reservation.eventDetails && (
                    <div className="md:col-span-2 flex items-start gap-3">
                      <svg className="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <div>
                        <p className="text-xs text-base-content/50 mb-1">Event Details</p>
                        <p className="text-sm font-medium">{reservation.eventDetails}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

