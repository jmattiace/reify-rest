var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var OrderSchema = new mongoose.Schema({
    user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId:      { type: String },
    companyName:    { type: String },
    brandName:      { type: String },
    productName:    { type: String },
    productType:    { type: String },
    quantity:       { type: Number },
    price:          { type: Number },
    color:          { type: String },
    size:           { type: String },
    linkUrl:        { type: String },
    thumbnailUrl:   { type: String },
    status:         { type: String, default: 'PENDING' }
});

OrderSchema.plugin(autoIncrement.plugin, { model: 'Order', field: 'orderNumber' });

module.exports = OrderSchema;