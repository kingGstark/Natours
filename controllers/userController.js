const catchAsync = require('../utils/catchAsync');
const ApiErrors = require('../utils/ApiErrors');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }

  return cb(new ApiErrors('not an image', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    data: 'is not defined yet',
  });
};

const filterObj = (obj, ...allowedFields) => {
  newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    next(
      new ApiErrors(
        'you cant edit password in this method.\n check updatePassword'
      )
    );

  const filter = filterObj(req.body, 'email', 'name');
  if (req.file) filter.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filter, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'your data was updated',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  res.status(200).json({
    status: 'success',
    message: 'the account has been delete it',
    data: {
      user: deletedUser,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
