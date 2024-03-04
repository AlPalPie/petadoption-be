const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        // Use this for DEVELOPMENT so that apps like Postman have access to the backend:
        //         if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        // Use this for PRODUCTION:
        //         if (allowedOrigins.indexOf(origin) !== -1) {
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions 