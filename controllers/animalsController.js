const Animal = require('../models/Animal')
const Image = require('../models/Image')
const fs = require('fs')


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
        if (req.file) { fsDelete(req.file) }
        return res.status(400).json({ message: 'Name and description fields are required' })
    }

    // Check for duplicate name
    const duplicate = await Animal.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        if (req.file) { fsDelete(req.file) }
        return res.status(409).json({ message: 'Duplicate animal name' })
    }

    // Create and store the new animal 
    const animal = await Animal.create({ name, description })
    

    let image;
    if (req.file) {
        // Create and store the new image
        image = await Image.create( { animal: animal._id, path: req.file.path, caption })
    } else {
        image = null
    }

    if (animal && image) { // Created 
        return res.status(201).json({ message: 'New animal created with image.' })
    } else if (animal) {
        return res.status(201).json({ message: 'New animal created.' })
    } else {
        if (req.file) { fsDelete(req.file) }
        return res.status(400).json({ message: 'Invalid animal data received' })
    }

}

// @desc Update a animal
// @route PATCH /animals
// @access Private
const updateAnimal = async (req, res) => {
    const { name, description } = req.body

    // Confirm data
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description fields are required' })
    }

    // Confirm animal exists to update
    const animal = await Animal.findOne({ name }).exec()

    if (!animal) {
        return res.status(400).json({ message: 'Animal not found' })
    }

    animal.name = name
    animal.description = description

    const updatedAnimal = await animal.save()

    res.json(`Animal '${animal.name}' updated`)
}

// @desc Delete a animal
// @route DELETE /animals
// @access Private
const deleteAnimal = async (req, res) => {
    const { name } = req.body

    // Confirm data
    if (!name) {
        return res.status(400).json({ message: 'Animal ID required' })
    }

    // Confirm animal exists to delete 
    const animal = await Animal.findOne({ name }).exec()

    if (!animal) {
        return res.status(400).json({ message: 'Animal not found' })
    }

    const result = await animal.deleteOne()

    const reply = `Animal '${animal.name}' with ID ${animal._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAnimals,
    createNewAnimal,
    updateAnimal,
    deleteAnimal
}