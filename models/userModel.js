const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required:true
    },
    lastName:{
        type: String,
        required:true
    },
    gender: String,
    age: Number,
    email: {
        type: String,
        unique: true
    },
    password: String,
    username: {
        type: String,
        unique: true
    },
    phone: String,
    bio: String,
    gift : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gift'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    hobbies: [String],
    occupation: String,
    dob: Date,
    location: String,
    stateOfOrigin: String,
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest'
    }],
    friends : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isRich:{
        type: Boolean,
        required: true
    },
    interestedIn: {
        type: String,
        enum: ['Male', 'Female', 'Both'],
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }, 
    reports: [{
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: {
            type: String,
            enum: ['Harassment', 'Scam', 'Fake Profile', 'Inappropriate Content', 'Other'],
            required: true
        },
        createdAt: { type: Date, default: Date.now }
    }], 
    picture: String
}, {timestamps: true});

userSchema.pre('save', function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = bycrypt.hashSync(this.password, 8);
    next();

})

const User = mongoose.model('User', userSchema);

module.exports = User;