const express = require('express');
const viewController = require('../controllers/viewControllers');
const router = express.Router();
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router.use(viewController.alerts);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.get('/login', authController.loggedIn, viewController.login);
router.get(
  '/',

  authController.loggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.loggedIn, viewController.getTour);

module.exports = router;
