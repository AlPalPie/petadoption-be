const mongoose = require('mongoose')

const animalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        pics: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Animal', animalSchema)