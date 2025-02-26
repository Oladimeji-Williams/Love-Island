const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const giftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }, 
    gifter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    giftee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})
const Gift = mongoose.model('Gift', giftSchema);
module.exports = Gift;