const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: [true, 'tour name is require'],
      unique: true,
    },
    slug: String,
    duration: { type: Number, require: [true, 'a tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      require: [true, 'a tour must have a group max'],
    },
    difficulty: {
      type: String,
      require: [true, 'must have a difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: '{VALUE} is not supported',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'the maximom of rating is 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      require: [true, 'it has to have a price'],
    },
    priceDiscount: { type: Number },
    summary: {
      type: String,
      trim: true,
      require: [true, 'must have a description'],
    },
    description: { type: String, trim: true },
    imageCover: { type: String, require: [true, 'must have a cover'] },
    images: [String],
    createAt: { type: Date, default: Date.now() },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        date: Number,
        day: String,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });
tourSchema.virtual('durationWeeks').get(function () {
  return Math.floor(this.duration / 7);
});
//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//DOCUMENT MIDDLEWARE BEFORE save and create
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});
// AGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
