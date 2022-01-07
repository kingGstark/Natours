const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiErrors');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const crypto = require('crypto');
const ApiErrors = require('../utils/ApiErrors');
const Email = require('../utils/emailSender');
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECREt, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOCKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeDate: req.body.passwordChangeDate,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return next(new ApiError('fields need it', 404));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new ApiError('incorrect email or password', 404));
  }

  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization ||
    req.headers.authorization?.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new ApiError('please login to have access', 401));
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECREt);

  const freshUser = await User.findById(decode.id);

  if (!freshUser) {
    return next(
      new ApiErrors('the user belonging this token no longer exist', 401)
    );
  }
  if (freshUser.hasRecentlyChangePass(decode.iat)) {
    return next(
      new ApiError('the user recently change password, login again', 401)
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new ApiError('you are not allow to perform this task', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //find user
  const user = await User.findOne({ email: req.body.email });
  if (!user) new ApiError('this email doesnt belong to a user', 404);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/resetpassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'reset email send',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    user.save({ validateBeforeSave: false });
    return next(new ApiErrors('the reset email coudln be send', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  let { password, passwordConfirm } = req.body;
  let passwordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  let user = await User.findOne({
    passwordResetToken: passwordToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) next(new ApiErrors('token expires or user doesnt exist', 404));
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const jwt = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: 'you have change your password successfully',
    token: jwt,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  //get User

  const user = await User.findById(req.user._id).select('+password');
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    return next(
      new ApiErrors('you neet to supply your old and new password', 404)
    );
  }
  //check if password is correct
  if (!(await user.checkPassword(oldPassword, user.password))) {
    return next(
      new ApiErrors('this password doesnt match to this user one', 404)
    );
  }

  //if so, change password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.validate();

  user.save();
  createSendToken(user, 200, req, res);
  //log user, return token
});

exports.loggedIn = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECREt);
      const freshUser = await User.findById(decode.id);

      if (!freshUser) {
        return next();
      }
      if (freshUser.hasRecentlyChangePass(decode.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();

  // if (!token) {
  //   return next(new ApiError('please login to have access', 401));
  // }
};

exports.logOut = (req, res) => {
  res.cookie('jwt', 'logged', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
