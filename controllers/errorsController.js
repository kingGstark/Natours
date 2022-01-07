const ApiErrors = require('../utils/ApiErrors');

const devErrors = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(err.satus);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      stack: err.stack,
    });
  } else {
    //render error
    res.status(err.statusCode).render('error', {
      title: 'error page',
      msg: err.message,
    });
  }
};

const prodErrors = (err, req, res) => {
  //api
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'server error',
      err: err,
      stack: err.stack,
    });
  }
  //render
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  return res.status(500).json({
    status: 'something went wrong',
    message: 'please try again later',
  });
};

const castErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiErrors(message, 404);
};

const duplicateValue = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `the field with the value of: ${value}, is duplicated`;
  return new ApiErrors(message, 404);
};

const validatorError = (err, next) => {
  const value = Object.values(err.errors).map((el) => el.message);
  const message = `detect a validation error:${value.join('. ')}`;
  return next(new ApiErrors(message, 404));
};

const invalidToken = (error) =>
  new ApiErrors('invalid token, please log again', 401);
const expiredToken = (error) =>
  new ApiErrors('token expired, please log again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    devErrors(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    console.log(error);
    if (error.name === 'CastError') error = castErrorDB(error);
    if (error.code === 11000) error = duplicateValue(error);
    if (error.name === 'ValidationError') error = validatorError(error, next);
    if (error.name === 'JsonWebTokenError') error = invalidToken(error);
    if (error.name === 'TokenExpiredError') error = expiredToken(error);

    prodErrors(error, req, res);
  }
};
