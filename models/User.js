const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: ["Customer"]
    },
    active: {
        type: Boolean,
        default: true
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal'
    }],
    applied: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Animal'
    }],
})

module.exports = mongoose.model('User', userSchema)