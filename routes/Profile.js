const express = require('express');
const router = express.Router();

const { 
    auth,
    isInstructor, 
    isStudent, 
    isAdmin
} = require('../middlewares/auth');

const {
    updateProfile,
    deleteProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard
} = require('../controllers/Profile');

router.put('/updateProfile', auth, updateProfile);
router.delete('/deleteProfile', auth, deleteProfile);
router.get('/getUserDetails', auth, getAllUserDetails);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.get('/instructorDashboard', auth, isInstructor, instructorDashboard);

module.exports = router;