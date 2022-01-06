const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'must have a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'must have a user'],
  },
  price: {
    type: Number,
    require: [true, 'a tour needs a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

BookingSchema.pre('/^find/', function () {
  this.populate('user').populate('tour');
  next();
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
