// require mongoose ODM
const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    content: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const LikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const PostSchema = new mongoose.Schema({
    photo: {
        type: String
    },
    content: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [CommentSchema],
    likes: [LikeSchema]    
},{
    timestamps: true
})

module.exports = mongoose.model('Post', PostSchema)