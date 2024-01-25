const Image = require('../models/Image')
const fs = require('fs')
const path = require('path')


// Helper function to delete files from filesystem
const fsDelete = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            console.log('Error deleting file:', err)
            return
        }
        console.log(`File ${path} successfully deleted.`)
    })
}


// @desc Get all images 
// @route GET /images
// @access Private
const getAllImages = async (req, res) => {
    // Get all images from MongoDB
    // find() returns a Query in the form of a Mongoose Document (has save method, getters/setters, virtuals, other Mongoose features)
    // lean() returns plain javascript objects instead of Mongoose Document
    const images = await Image.find().lean()

    // If no images 
    if (!images?.length) {
        return res.status(400).json({ message: 'No images found' })
    }

    res.json(images)
}


// @desc Create new image
// @route POST /images
// @access Private
const createNewImage = async (req, res) => {
    const { animalID, caption } = req.body

    // Confirm data
    if (!animalID || !caption || !req.file ) {
        return res.status(400).json({ message: 'animalID and caption fields and image file are required' })
    }

    const urlPath = path.join(path.basename(path.dirname(req.file.path)), path.basename(req.file.path))
    console.log(`urlPath = ${urlPath}`)

    // Create and store the new image
    const image = await Image.create( { animal: animalID, path: urlPath, caption })

    if (image) { // Created 
        return res.status(201).json({ message: 'New image created' })
    } else {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(400).json({ message: 'Invalid image data received' })
    }

}

// @desc Update a image
// @route PATCH /images
// @access Private
const updateImage = async (req, res) => {
    const { id, caption } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'id field is required.' })
    }
    if (!caption) {
        return res.status(400).json({ message: 'caption field is required.'})
    }

    // Confirm image exists to update
    const image = await Image.findById(id).exec()

    if (!image) {
        return res.status(400).json({ message: 'Image not found' })
    }

    if (caption) image.caption = caption

    const updatedImage = await image.save()

    res.json(`Image with ID ${id} updated`)
}

// @desc Delete a image
// @route DELETE /images
// @access Private
const deleteImage = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Image ID required' })
    }

    // Confirm image exists to delete 
    const image = await Image.findById(id).exec()

    if (!image) {
        return res.status(400).json({ message: 'Image not found' })
    }

    fsDelete(path.join('public', image.path))
    const result = await image.deleteOne()

    const reply = `Image with ID ${id} deleted`

    res.json(reply)
}

module.exports = {
    getAllImages,
    createNewImage,
    updateImage,
    deleteImage
}