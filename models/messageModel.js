const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
        
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 

    },
    message: { 
        type: String, 
        required: true 

    },
    createdAt: { 
        type: Date, 
        default: Date.now 

    }

})

const messages = mongoose.model('Message', messageSchema);
module.exports = messages;