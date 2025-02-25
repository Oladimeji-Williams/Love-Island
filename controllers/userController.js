const user = require('../models/userModel');
const friendRequest = require('../models/friendRequest');
const Gift = require('../models/giftModel');
const messages = require('../models/messageModel');
const mongoose = require('mongoose');



exports.getAllUsers = async (req, res) => {
    try {
        const users = await user.find().populate([
            {
                path: 'friendRequests',
                populate: {
                    path: 'sender', 
                    select: 'firstName lastName email profilePic' 
                }
            },
            {
                path: 'friends',
                select: 'firstName lastName email profilePic' 
            },
            {
                path: 'gift',
                select: 'name description price image'
            },
            { 
                path: 'messages',
                select: 'message createdAt',
                populate: {
                    path: 'sender',
                    select: 'firstName lastName email profilePic'
                }
            },
        ]);
        if (users.length < 1) {
            return res.status(404).json({
                message: 'No user found'
            });
        }
        res.status(200).json({
            users
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

exports.createUser = async (req, res) => {
    try {
        const updatedData = {...req.body};
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

exports.getUsersByIntrest = async (req, res) => {
    try {
        const { interestedIn } = req.params;
        if (!interestedIn) {
            return res.status(400).json({
                message: 'Please provide your interest'
            });
        }
        // const users = await user.find({interestedIn}); // what does this do? It finds users with the specified interest in specified case sensitivity
        const users = await user.find({interestedIn: new RegExp(`^${interestedIn}$`, 'i')}); // what does this do? It finds users with the specified interest irrespective of the case sensitivity
        console.log(users)
        if (users.length < 1) {
            return res.status(404).json({
                message: 'No user found'
            });
        }
        res.status(200).json({
            users: users.map(user => {
                return {
                    name: user.username,
                    email: user.email,
                    interestedIn: user.interestedIn
                }
            })
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}


exports.getUsersByHobbies = async (req, res) => {
    try {
        // Get hobbies from query parameters
        const { hobbies } = req.query;
        if (!hobbies) {
            return res.status(400).json({
                message: 'Please provide at least one hobby'
            });
        }

        // Convert hobbies string into an array, because the hobbies are comma-separated
        const hobbiesArray = hobbies.split(',').map(hobby => hobby.trim());

        // Find users whose hobbies array contains any of the provided hobbies
        const users = await user.find({
            hobbies: { $in: hobbiesArray }
        });

        if (users.length === 0) {
            return res.status(404).json({
                message: 'No users found with the given hobbies'
            });
        }


        res.status(200).json({
            users: users.map(user => ({
                name: user.username,
                email: user.email,
                hobbies: user.hobbies
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};

//get user details by id
exports.getUsersById = async (req, res) => {
    try {
        const id = req.params.id
        // validate id
        if (!id) {
            return res.status(400).json({
                message: 'Please provide an id'
            });
        }
        // check if id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid id'
            });
        }
        const existingUser = await user.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            existingUser: {
                name: existingUser.username,
                email: existingUser.email,
                hobbies: existingUser.hobbies,
                interestedIn: existingUser.interestedIn
            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
  

}


exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                message: 'Please provide an id'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid id'
            });
        }
        const userToDelete = await user.findByIdAndUpdate(id, {is_deleted: true}, {new: true});
        if (!userToDelete) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
        
    }
}

exports.reportUser = async (req, res) => {
    try {
        const id  = req.params.id
        const { reason } = req.body; 

        if (!id || !reason ) {
            return res.status(400).json({
                message: 'Please provide user ID, reason,'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid ID'
            });
        }

        const userToReport = await user.findById(id).populate({
            path: 'reports.reportedBy',
            select: 'firstName lastName email'
        } );
        console.log(userToReport);
        if (!userToReport) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const report = {
            reason,
            reportedBy: req.user._id // what does this do? It attaches the id of the user making the report to the report object
        };

        userToReport.reports.push(report);
        await userToReport.save();

        res.status(200).json({ message: 'User reported successfully' , userToReport});

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};


exports.getAllFriendRequestByUser = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                message: 'Please provide an id'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid id'
            });
        }
        const userFriendRequest = await friendRequest.find({user: id}).populate('user');
        if (!userFriendRequest) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            userFriendRequest
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

exports.sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user._id; 
        if (!receiverId) {
            return res.status(400).json({
                message: 'Please provide receiver id'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                message: 'Invalid receiver id'
            });
        }
        if (!senderId) {
            return res.status(400).json({
                message: 'Please provide sender id'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({
                message: 'Invalid sender id'
            });
        }
        if (senderId === receiverId) {
            return res.status(400).json({
                message: 'You cannot send friend request to yourself'
            });
        }
        const sender = await user.findById(senderId);
        if (!sender) {
            return res.status(404).json({
                message: 'Sender not found'
            });
        }
        const receiver = await user.findById(receiverId) 
        if (!receiver) {
            return res.status(404).json({
                message: 'Receiver not found'
            });
        }
        const friendRequestExists = await friendRequest.findOne({ sender: senderId, receiver: receiverId });
        if (friendRequestExists) {
            return res.status(400).json({
                message: 'Friend request already sent'
            });
        }
        const newFriendRequest = await friendRequest.create({ sender: senderId, receiver: receiverId });
        receiver.friendRequests.push(newFriendRequest);
        await receiver.save();
        res.status(201).json({
            message: 'Friend request sent successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}



exports.acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const receiverId = req.user._id.toString();

        if (!requestId) {
            return res.status(400).json({ message: 'Please provide request ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        const receiver = await user.findById(receiverId).populate('friendRequests');
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const friendRequests = await friendRequest.findById(requestId).populate('sender');
        if (!friendRequests) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (friendRequests.receiver.toString() !== receiverId) {
            return res.status(400).json({ message: 'You cannot accept this friend request' });
        }

        if (friendRequests.status === 'accepted') {
            return res.status(400).json({ message: 'Friend request already accepted' });
        }

        // Update friend request status
        await friendRequest.findByIdAndUpdate(requestId, { status: 'accepted' });

        // Add sender to receiver's friends list
        await user.findByIdAndUpdate(receiverId, { $push: { friends: friendRequests.sender._id } });

        // Fetch updated user with friends populated
        const updatedReceiver = await user.findById(receiverId).populate('friends', 'name email'); // Populate name and email
        
        await friendRequest.findByIdAndDelete(requestId); // Delete friend request after accepting
       
        res.status(200).json({
            message: 'Friend request accepted successfully',
            friends: updatedReceiver.friends // Return updated friends list
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAllGifts = async (req, res) => {
    try {
        const gifts = await Gift.find().populate('gifter giftee');
        if (gifts.length < 1) {
            return res.status(404).json({
                message: 'No gift found'
            });
        }
        res.status(200).json({
            gifts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

exports.createGift = async (req, res) => {
    try {
        const updatedData = {...req.body};
        if (!updatedData.name || !updatedData.description || !updatedData.price || !updatedData.image) {
            return res.status(400).json({
                message: 'Please provide name, description, price and image'
            });
        }
        // check for duplicate gift
        const existingGift = await Gift.findOne({name: updatedData.name});
        if (existingGift) {
            return res.status(400).json({
                message: 'Gift already exists'
            });
        }
        const newGift = await Gift.create(updatedData);
        if (!newGift) {
            return res.status(500).json({
                message: 'Gift not created'
            });
        }
        
        res.status(201).json({
            newGift
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
        
    }
}

exports.sendGift = async (req, res) => {
    try {
        const { giftId, friendId } = req.body;
        const gifterId = req.user._id.toString();

        if (!giftId || !friendId) {
            return res.status(400).json({ message: 'Gift ID and Friend ID are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(giftId) || !mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: 'Invalid IDs' });
        }
        if (gifterId === friendId) {
            return res.status(400).json({ message: 'You cannot send a gift to yourself' });
        }

        // Check if the receiver is in sender's friends list
        const gifter = await user.findById(gifterId);
        if (!gifter || !gifter.friends.includes(friendId)) {
            return res.status(400).json({ message: 'This user is not your friend' });
        }

        // Check if the gift exists
        const gift = await Gift.findById(giftId);
        if (!gift) {
            return res.status(404).json({ message: 'Gift not found' });
        }

        // Send the gift
        const sentGift = new Gift({
            name: gift.name,
            description: gift.description,
            price: gift.price,
            image: gift.image,
            gifter: gifterId,
            giftee: friendId
        });

       

        await sentGift.save();

        // Update the user receiving the gift, gift field
        const friend = await user.findById(friendId);
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }
        
        friend.gift.push(sentGift._id); // Add the gift to the friend's gift array
        await friend.save(); // Save the updated friend document

        res.status(200).json({
            message: 'Gift sent successfully',
            gift: sentGift
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllMessagesByUser = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({
                message: 'Please provide an id'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid id'
            });
        }
        const newMessages = await messages.find({receiver: id}).populate('sender receiver');
        if (!newMessages || newMessages.length < 1) {
            return res.status(404).json({
                newMessage: 'No message found'
            });
        }
        res.status(200).json({
            newMessages
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

exports.sendMessages = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id.toString();
        if (!receiverId || !message) {
            return res.status(400).json({
                message: 'Please provide receiver id and message'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                message: 'Invalid receiver id'
            });
        }
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({
                message: 'Invalid sender id'
            });
        }
        if (senderId === receiverId) {
            return res.status(400).json({
                message: 'You cannot send message to yourself'
            });
        }
        const sender = await user.findById(senderId);
        if (!sender) {
            return res.status(404).json({
                message: 'Sender not found'
            });
        }
        const receiver = await user.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                message: 'Receiver not found'
            });
        }
        const newMessage = await messages.create({ sender: senderId, receiver: receiverId, message });
        if (!newMessage) {
            return res.status(500).json({
                message: 'Message not sent'
            });
        }
        receiver.messages.push(newMessage);
        await receiver.save();
        res.status(201).json({
            message: 'Message sent successfully'
    })} catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}
