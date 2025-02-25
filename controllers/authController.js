const user = require('../models/userModel');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('dotenv');

env.config();

exports.signup = async (req, res) => {
    try {
        const updatedData = {...req.body};
    
        // Ensure 'interestedIn' is provided
        if (!updatedData.interestedIn || !['Male', 'Female', 'Both'].includes(updatedData.interestedIn)) {
            return res.status(400).json({ message: 'Please select your interest: Male, Female, or Both' });
        }

        const existingUser = await user.findOne({email: updatedData.email});
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }
        const newUser = await user.create(updatedData);
        res.status(201).json({
            newUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}




exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }
        const existingUser = await user.findOne({email});
        if (!existingUser) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        const isPasswordCorrect = await bycrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Generate tokens
        const accessToken = jwt.sign({ id: existingUser._id, email: existingUser.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_SECRET_EXPIRES_IN } );
        const refreshToken = jwt.sign({ id: existingUser._id, email: existingUser.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN });


        res.status(200).json({
            confirm: 'Login successful',
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(403).json({
                message: 'Access denied, token missing'
            });
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (error, user) => {
            if (error) {
                return res.status(403).json({
                    message: 'Invalid token'
                });
            }
            const accessToken = jwt.sign({email: user.email}, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_SECRET_EXPIRES_IN});
            res.status(200).json({
                accessToken
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
        
    }
}