const Animal = require('../models/Animal')
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


// @desc Get all animals 
// @route GET /animals
// @access Private
const getAllAnimals = async (req, res) => {
    // Get all animals from MongoDB
    // find() returns a Query in the form of a Mongoose Document (has save method, getters/setters, virtuals, other Mongoose features)
    // lean() returns plain javascript objects instead of Mongoose Document
    const animals = await Animal.find().lean()

    // If no animals 
    if (!animals?.length) {
        return res.status(400).json({ message: 'No animals found' })
    }

    res.json(animals)
}

// @desc Create new animal
// @route POST /animals
// @access Private
const createNewAnimal = async (req, res) => {
    const { name, description, caption } = req.body

    // Confirm data
    if (!name || !description) {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(400).json({ message: 'Name and description fields are required' })
    }

    // Check for duplicate name
    const duplicate = await Animal.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(409).json({ message: 'Duplicate animal name' })
    }

    // Create and store the new animal 
    const animal = await Animal.create({ name, description })
    

    let image;
    if (req.file) {
        const urlPath = path.join(path.basename(path.dirname(req.file.path)), path.basename(req.file.path))
        // Create and store the new image
        image = await Image.create( { animal: animal._id, path: urlPath, caption })
    } else {
        image = null
    }

    if (animal && image) { // Created 
        return res.status(201).json({ message: 'New animal created with image.' })
    } else if (animal) {
        return res.status(201).json({ message: 'New animal created.' })
    } else {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(400).json({ message: 'Invalid animal data received' })
    }

}

// @desc Update a animal
// @route PATCH /animals
// @access Private
const updateAnimal = async (req, res) => {
    const { id, name, description } = req.body

    // Confirm data
    if (!name || !description) {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(400).json({ message: 'Name and description fields are required' })
    }

    // Confirm animal exists to update
    const animal = await Animal.findOne({ name }).exec()

    if (!animal) {
        return res.status(400).json({ message: 'Animal not found' })
    }

    let image;
    if (req.file) {
        const urlPath = path.join(path.basename(path.dirname(req.file.path)), path.basename(req.file.path))
        // Create and store the new image
        image = await Image.create( { animal: animal._id, path: urlPath, caption: '' })
    } else {
        image = null
    }

    animal.name = name
    animal.description = description

    const updatedAnimal = await animal.save()

    if (updatedAnimal && image) { // Created 
        return res.status(200).json({ message: `Animal (${updatedAnimal.name}) updated with new image.` })
    } else if (updatedAnimal) {
        return res.status(200).json({ message: `Animal (${updatedAnimal.name}) updated.` })
    } else {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(400).json({ message: 'Invalid animal data received' })
    }
}

// @desc Delete a animal
// @route DELETE /animals
// @access Private
const deleteAnimal = async (req, res) => {
    const { name } = req.body

    // Confirm data
    if (!name) {
        return res.status(400).json({ message: 'Animal name required' })
    }

    // Confirm animal exists to delete 
    const animal = await Animal.findOne({ name }).exec()

    if (!animal) {
        return res.status(400).json({ message: 'Animal not found' })
    }

    // Find all images associated with this animal
    const images = await Image.find({ animal: animal._id }).exec()

    if (images) {
        for (const image of images) {
            fsDelete(path.join('public', image.path))
            await image.deleteOne()
        }
    }

    // Delete animal from database
    await animal.deleteOne()

    if (animal && images) { // Created 
        return res.status(200).json({ message: `Animal (${animal.name}) deleted along with its images.` })
    } else if (animal) {
        return res.status(200).json({ message: `Animal (${animal.name}) deleted.` })
    } else {
        if (req.file) { fsDelete(req.file.path) }
        return res.status(400).json({ message: 'Invalid animal data received' })
    }
}

module.exports = {
    getAllAnimals,
    createNewAnimal,
    updateAnimal,
    deleteAnimal
}