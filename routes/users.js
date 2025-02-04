const mongoose = require("mongoose");
// const passport = require("passport");
const plm = require("passport-local-mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/newapp')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String},
  email: { type: String, required: true, unique: true },
  bio: { type: String },
  fullname: { type: String, required: true },
  dp: { type: String }, // URL to profile picture
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }] //using this i will get post's id in user
});

userSchema.plugin(plm);
module.exports = mongoose.model("User", userSchema);