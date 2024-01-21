const express = require('express')
const router = express.Router()
const imagesController = require('../controllers/imagesController')
const verifyJWT = require('../middleware/verifyJWT')
const uploadFile = require('../middleware/uploadFile')

// verify that client has a proper access token before they can access these routes
// FIXME: uncomment this when ready
//router.use(verifyJWT)


router.route('/')
    .get(imagesController.getAllImages)
    .post(uploadFile, imagesController.createNewImage)
    .patch(imagesController.updateImage)
    .delete(imagesController.deleteImage)

module.exports = router