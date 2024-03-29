const User = require('../models/User')
const Note = require('../models/Note')
const bcrypt = require('bcrypt')
const Animal = require('../models/Animal')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    // mongodb.collation allows for language-specific rules for string comparison
    //  locale: 'en' => English
    //  strength: 2 => Secondary level of comparison. Collation performs comparisons up to secondary differences, such as diacritics.
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
}

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data 
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

// @desc Update a user's list of favorite animals ; if animal already favorited it will be removed
// @route PATCH /users/favorites
// @access Private
const updateUserFavorites = async (req, res) => {
    const { userId, animalId } = req.body

    // Confirm data 
    if (!userId || !animalId) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(userId).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Does the animal exist to update?
    const animal = await Animal.findById(animalId).exec()
    if (!animal) {
        return res.status(400).json({ message: 'Aniimal not found' })
    }

    let favorites = user.favorites

    const index = favorites.indexOf(animalId)
    if (index !== -1) {
        favorites.splice(index, 1)
    } else {
        favorites.push(animalId)
    }
    
    user.favorites = favorites

    const updatedUser = await user.save()

    if (index !== -1) {
        res.json({ message: `${updatedUser.username} updated by removing ${animal.name} from its Favorites.` })
    } else {
        res.json({ message: `${updatedUser.username} updated by adding ${animal.name} to its Favorites.` })
    }
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
    updateUserFavorites
}