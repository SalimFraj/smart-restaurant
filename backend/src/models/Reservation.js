import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: 1,
    max: 20
  },
  eventType: {
    type: String,
    enum: ['regular', 'birthday', 'corporate', 'anniversary', 'other'],
    default: 'regular'
  },
  eventDetails: {
    type: String,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for query performance
reservationSchema.index({ date: 1, time: 1 });
reservationSchema.index({ user: 1, createdAt: -1 });
reservationSchema.index({ status: 1 });

// Compound index for duplicate reservation prevention
// This will speed up the duplicate check query
reservationSchema.index({ user: 1, date: 1, time: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);

