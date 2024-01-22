const multer = require('multer')
const path = require('path')


// Setup multer storage to manage storing files into filesystem (disk)
const storage = multer.diskStorage( {
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const uploadFile = (req, res, next) => {
    const upload = multer({storage: storage}).single('multerimage')

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(`Multer error occured with error: ${err}`)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(`Unknown error occured with error: ${err}`)
        }
        // Everything went fine. 
        next()
    })
}


module.exports = uploadFile