const express = require('express')
const router = express.Router()
const imagesController = require('../controllers/imagesController')
const verifyJWT = require('../middleware/verifyJWT')
const multer = require('multer')
const path = require('path')

// verify that client has a proper access token before they can access these routes
// FIXME: uncomment this when ready
//router.use(verifyJWT)

// Setup multer storage to manage storing files into filesystem (disk)
const storage = multer.diskStorage( {
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})


router.route('/')
    .get(imagesController.getAllImages)
    .post(upload.single('multer-image'), imagesController.createNewImage)
    .patch(imagesController.updateImage)
    .delete(imagesController.deleteImage)

module.exports = router