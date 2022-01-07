const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiErrors');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
  //get tour data
  const tours = await Tour.find();
  //build template

  //render the template with the step 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //get data

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new ApiError('no tour found', 404));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} tour`,
      tour,
    });
});

exports.login = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'login',
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  console.log(bookings);
  const toursIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: toursIds } });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
