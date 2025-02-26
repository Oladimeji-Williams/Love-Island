const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true
  },
  bio: {
    type: String
  },
  interestedIn: {
    type: [String],
    enum: ["Married", "Single", "Man", "Woman"]
  },
  hobbies: {
    type: [String],
    default: []
  },
  birthday: {
    type: Date
  },
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" }
    ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
}
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")){
    return next()
  };
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);