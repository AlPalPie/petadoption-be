const express = require('express')
const router = express.Router()
const animalsController = require('../controllers/animalsController')
const verifyJWT = require('../middleware/verifyJWT')
const uploadFile = require('../middleware/uploadFile')

router.route('/')
    .get(animalsController.getAllAnimals)

// verify that client has a proper access token before they can access these routes
router.use(verifyJWT)
router.route('/')
    .post(uploadFile, animalsController.createNewAnimal)
    .patch(uploadFile, animalsController.updateAnimal)
    .delete(animalsController.deleteAnimal)

module.exports = router