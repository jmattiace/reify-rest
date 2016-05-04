var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var OrderSchema = new mongoose.Schema({
    user_id:  { type: String, required: true },
    productId: { type: String }, 
    brandName: { type: String },
    productName: { type: String },
    productType: { type: String },
    quantity: { type: String },
    price: { type: Number },
    color: { type: String },
    size: { type: String },
    linkUrl: { type: String },
    thumbnailUrl: { type: String },
    status: { type: String, default: 'PENDING' }
});

OrderSchema.plugin(autoIncrement.plugin, { model: 'Order', field: 'orderNumber' });

module.exports = OrderSchema;