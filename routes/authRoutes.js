const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

// Authorization Routes:
//  '/auth' = login page
//  '/auth/refresh' = refreshes JWT access token
//  '/auth/logout' = logs user out of their account



// this post method has two callback functions passed to it
//     any number of callbacks can be provided, all are treated equally and behave just like middleware
//     except these callbacks can invoke next('route') to bypass the remaining route callbacks
router.route('/')
    .post(loginLimiter, authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

module.exports = router