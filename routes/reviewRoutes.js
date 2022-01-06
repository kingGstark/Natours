const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setUserAndTourIds,
    reviewController.addReview
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .get(
    authController.restrictTo('user', 'admin'),
    reviewController.getOneReview
  );

module.exports = router;
