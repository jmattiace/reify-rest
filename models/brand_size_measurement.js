var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var BrandSizeMeasurementSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  gender: { type: String, enum: ['men', 'women'], default: 'men', required: true },
  sizeType: { type: String, enum: ['regular', 'tall'], required: true },
  size: { type: String, enum: ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'], required: true },
  waistMeasurement: { type: Number, min: 0 },
  chestMeasurement: { type: Number, min: 0 },
  neckMeasurement: { type: Number, min: 0 },
  sleeveMeasurement: {type: Number, min: 0 }
});

BrandSizeMeasurementSchema.plugin(autoIncrement.plugin, { model: 'BrandSizeMeasurement', field: 'brandSizeNumber' });
BrandSizeMeasurementSchema.pre('validate', function(next) {
  this.brandName = this.brandName.toLowerCase();
  this.gender = this.gender.toLowerCase();
  this.sizeType = this.sizeType.toLowerCase();
  this.size = this.size.toLowerCase();
  next();
});

module.exports = BrandSizeMeasurementSchema;
