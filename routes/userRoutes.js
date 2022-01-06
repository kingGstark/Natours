const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signUp);
router.post('/logIn', authController.logIn);
router.get('/logout', authController.logOut);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:resetToken', authController.resetPassword);
router.patch(
  '/changePassword',
  authController.protect,
  authController.changePassword
);
//protect all routes after this middleware
router.use(authController.protect);

router.patch(
  '/changeMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get(
  '/me',

  userController.getMe,
  userController.getUser
);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)

  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
