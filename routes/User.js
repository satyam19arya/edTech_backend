const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

const {
    logIn,
    signUp,
    sendOtp,
    changePassword,
    refreshAccessToken,
    logout
} = require('../controllers/Auth');

const {
    resetPasswordToken,
    resetPassword
} = require('../controllers/ResetPassword');

router.post('/login', logIn);
router.post('/signup', signUp);
router.post('/sendotp', sendOtp);
router.post('/changepassword', auth, changePassword);
router.get('/refresh', refreshAccessToken);
router.post('/logout', logout);

router.post('/resetpasswordtoken', resetPasswordToken);
router.post('/resetpassword', resetPassword);

module.exports = router;