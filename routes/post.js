const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    // imageText: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    username: {type: String},
    dp: {type: String},
    image: {type: String}, //using this i will get user's id in post
    createdAt: { type: Date, default: Date.now },
    likes: { type: Array, default: [] }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
