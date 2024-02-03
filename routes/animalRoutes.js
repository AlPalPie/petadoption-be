const express = require('express')
const router = express.Router()
const animalsController = require('../controllers/animalsController')
const verifyJWT = require('../middleware/verifyJWT')
const { uploadFileToServer } = require('../middleware/uploadFile')

router.route('/')
    .get(animalsController.getAllAnimals)

// verify that client has a proper access token before they can access these routes
router.use(verifyJWT)
router.route('/')
    .post(uploadFileToServer, animalsController.createNewAnimal)
    .patch(uploadFileToServer, animalsController.updateAnimal)
    .delete(animalsController.deleteAnimal)

module.exports = router