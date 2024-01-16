const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const imageSchema = new mongoose.Schema(
    {
        animal: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Animal'
        },
        path: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Image', imageSchema)