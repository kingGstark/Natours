const catchAsync = require('../utils/catchAsync');
const ApiErrors = require('../utils/ApiErrors');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setUserAndTourIds = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.user) req.body.user = req.user._id;
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getOneReview = factory.getOne(Review);
exports.addReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
