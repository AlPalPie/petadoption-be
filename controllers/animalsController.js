const Animal = require('../models/Animal')
const Image = require('../models/Image')
const path = require('path')
const { uploadS3Object, deleteS3Object, fsDelete } = require('../middleware/uploadFile')




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
        // upload image to S3
        const s3Result = await uploadS3Object(req.file)
        console.log(s3Result)
        // delete image stored in server now that it is in S3
        fsDelete(req.file.path)

        // Construct S3 URL path manually
        const urlPath = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${req.file.filename}`

        // Create the new Image document
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
        // upload image to S3
        const s3Result = await uploadS3Object(req.file)
        console.log(s3Result)
        // delete image stored in server now that it is in S3
        fsDelete(req.file.path)

        // Construct S3 URL path manually
        const urlPath = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${req.file.filename}`

        // Create the new Image document
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
            // Delete image in S3
            const s3Result = await deleteS3Object(image.path)
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