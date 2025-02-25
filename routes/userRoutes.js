const express = require('express');
const router = express.Router();
const userController = require('/Users/mac/dating_app_api/controllers/userController.js');
const authController = require('/Users/mac/dating_app_api/controllers/authController.js');
const { protectRoutes } = require('/Users/mac/dating_app_api/middlewares/authMiddleware.js');


router.get('/users', protectRoutes, userController.getAllUsers);
router.post('/users', userController.createUser);
router.get('/users/interest/:interestedIn', userController.getUsersByIntrest);
router.get('/users/hobbies', userController.getUsersByHobbies);
router.get('/users/:id', userController.getUsersById);
router.delete('/users/:id', userController.deleteUser);

// report user
router.post('/users/report/:id', protectRoutes, userController.reportUser);

// friend request
router.get('/users/friend-request/:id', userController.getAllFriendRequestByUser);
router.post('/users/friend-request', protectRoutes, userController.sendFriendRequest);
router.post('/users/friend-request/accept', protectRoutes, userController.acceptFriendRequest);

//auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// gift routes
router.get('/gifts', userController.getAllGifts);
router.post('/gifts', userController.createGift);
router.post('/gifts/send-gifts', protectRoutes, userController.sendGift);

//message routes
router.get('/messages/:id', userController.getAllMessagesByUser);
router.post('/messages', protectRoutes, userController.sendMessages);


module.exports = router;