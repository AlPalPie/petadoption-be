const express = require('express')
const router = express.Router()
const animalsController = require('../controllers/animalsController')
const verifyJWT = require('../middleware/verifyJWT')



router.route('/')
    .get(animalsController.getAllAnimals)
    .post(animalsController.createNewAnimal)
    .patch(animalsController.updateAnimal)
    .delete(animalsController.deleteAnimal)

module.exports = router