const express = require('express')
const router = express.Router()
const imagesController = require('../controllers/imagesController')
const verifyJWT = require('../middleware/verifyJWT')
const { uploadFileToServer } = require('../middleware/uploadFile')

router.route('/')
    .get(imagesController.getAllImages)

// verify that client has a proper access token before they can access these routes
router.use(verifyJWT)

router.route('/')
    .post(uploadFileToServer, imagesController.createNewImage)
    .patch(imagesController.updateImage)
    .delete(imagesController.deleteImage)

module.exports = router