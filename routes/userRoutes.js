const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

// allowing new user creation to be accessed publicly
router.route('/')
    .post(usersController.createNewUser)

// verify that client has a proper access token before they can access these routes
router.use(verifyJWT)

router.route('/')
    .get(usersController.getAllUsers)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

router.route('/favorites')
    .patch(usersController.updateUserFavorites)

module.exports = router
