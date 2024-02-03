const multer = require('multer')
const path = require('path')
const fs = require('fs')
const S3 = require('aws-sdk/clients/S3')


const bucketName = process.env.AWS_BUCKET_NAME
const region  = process.env.AWS_BUCKET_REGION
const accessKeyId  = process.env.AWS_ACCESS_KEY
const secretAccessKey  = process.env.AWS_SECRET_KEY


const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

class FileTypeError extends Error {
    constructor(message) {
        super(message)
        this.name = 'FileTypeError'
    }
}

// Setup multer storage to manage storing files into filesystem (disk)
const storage = multer.diskStorage( {
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

// Restrict uploads to only JPG and PNG images
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new FileTypeError('Only JPEG and PNG images are allowed.'), false);
    }
};

const uploadFileToServer = (req, res, next) => {
    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
    }).single('multerimage')

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(`Multer error occured with error: ${err}`)
        } else if (err instanceof FileTypeError) {
            console.log(err)
            return res.status(415).json({ message: 'Only JPEG and PNG images are allowed.' })
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(`Unknown error occured with error: ${err}`)
        }
        // Everything went fine. 
        next()
    })
}

const uploadS3Object = (file) => {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}

const deleteS3Object = (key) => {
    const deleteParams = {
        Bucket: bucketName,
        Key: key
    }

    return s3.deleteObject(deleteParams).promise()
}


// Helper function to delete files from filesystem
const fsDelete = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            console.log('Error deleting file:', err)
            return
        }
        console.log(`File ${path} successfully deleted.`)
    })
}


module.exports = { uploadFileToServer, uploadS3Object, deleteS3Object, fsDelete }