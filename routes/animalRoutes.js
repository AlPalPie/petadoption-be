const express = require('express')
const router = express.Router()
const animalsController = require('../controllers/animalsController')
const verifyJWT = require('../middleware/verifyJWT')
const uploadFile = require('../middleware/uploadFile')

// verify that client has a proper access token before they can access these routes
// FIXME: uncomment this when ready
//router.use(verifyJWT)

router.route('/')
    .get(animalsController.getAllAnimals)
    .post(uploadFile, animalsController.createNewAnimal)
    .patch(uploadFile, animalsController.updateAnimal)
    .delete(animalsController.deleteAnimal)

module.exports = router