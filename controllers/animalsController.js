const Animal = require('../models/Animal')
const User = require('../models/User')

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
    const { name, description, pics } = req.body

    // Confirm data
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description fields are required' })
    }

    // Check for duplicate name
    // FIXME: what does exec() do?
    const duplicate = await Animal.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate animal name' })
    }

    // Create and store the new animal 
    const animal = await Animal.create({ name, description, pics })

    if (animal) { // Created 
        return res.status(201).json({ message: 'New animal created' })
    } else {
        return res.status(400).json({ message: 'Invalid animal data received' })
    }

}

// @desc Update a animal
// @route PATCH /animals
// @access Private
const updateAnimal = async (req, res) => {
    const { name, description, pics } = req.body

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
    animal.pics = pics

    const updatedAnimal = await animal.save()

    res.json(`Animal '${updatedAnimal.name}' updated`)
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
    const animal = await Animal.findOne({ name }).lean()/exec()

    if (!animal) {
        return res.status(400).json({ message: 'Animal not found' })
    }

    const result = await animal.deleteOne()

    const reply = `Animal '${result.name}' with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAnimals,
    createNewAnimal,
    updateAnimal,
    deleteAnimal
}