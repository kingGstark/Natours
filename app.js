const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const fs = require('fs');
const globalErrors = require('./controllers/errorsController.js');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const ApiError = require('./utils/ApiErrors');
const expressSanitizer = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const viewRouter = require('.//routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const cookieparser = require('cookie-parser');
//(1)Global MIDDLEWARES
//security https
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(helmet({ contentSecurityPolicy: false }));

//development logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request from same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this ip',
});
app.use('/api', limiter);

//bodyparser
app.use(express.json({ limit: '10kb' }));
app.use(cookieparser());
//serving statics files
app.use(express.static('./public/'));

//returning a string
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

//data sanitization against nosql query injection
app.use(expressSanitizer());
//data sanitization against xss
app.use(xssClean());

//prevent parameter polution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'maxGroupSize',
      'price',
    ],
  })
);
/////Routes
app.get('/api/v1/video', (req, res) => {
  const stream = fs.createReadStream('./dev-data/data/test.mkv');
  stream.pipe(res);
});

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new ApiError(`not found ${req.originalUrl}`, 400));
});
app.use(globalErrors);
module.exports = app;
