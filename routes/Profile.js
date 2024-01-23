const express = require('express');
const router = express.Router();

const { 
    auth,
    isInstructor
} = require('../middlewares/auth');

const {
    updateProfile,
    deleteProfile,
    getUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard
} = require('../controllers/Profile');

router.put('/updateProfile', auth, updateProfile);
router.delete('/deleteProfile', auth, deleteProfile);
router.get('/getUserDetails', auth, getUserDetails);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.get('/instructorDashboard', auth, isInstructor, instructorDashboard);

module.exports = router;