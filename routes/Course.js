const express = require('express');
const router = express.Router();

const { 
    auth,
    isInstructor, 
    isStudent, 
    isAdmin
} = require('../middlewares/auth');

const { 
    createCourse,
    editCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    getInstructorCourses,
    deleteCourse
} = require('../controllers/Course');

const {
    createCategory,
    getAllCategories,
    categoryPageDetails
} = require('../controllers/Category');

const {
    createSection,
    updateSection,
    deleteSection
} = require('../controllers/Section');

const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/SubSection');

const {
    createRating,
    getAverageRating,
    getAllRating
} = require('../controllers/RatingAndReview');

router.post('/createCourse', auth, isInstructor, createCourse);
router.post('/editCourse', auth, isInstructor, editCourse);
router.get('/getAllCourses', getAllCourses);
router.get('/getCourseDetails', getCourseDetails);
router.get('/getFullCourseDetails', getFullCourseDetails);
router.get('/getInstructorCourses', auth, isInstructor, getInstructorCourses);
router.delete('/deleteCourse', auth, isInstructor, deleteCourse);

router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/getAllCategories', getAllCategories);
router.get('/categoryPageDetails', categoryPageDetails);

router.post('/createSection', auth, isInstructor, createSection);
router.put('/updateSection', auth, isInstructor, updateSection);
router.delete('/deleteSection', auth, isInstructor, deleteSection);

router.post('/createSubSection', auth, isInstructor, createSubSection);
router.put('/updateSubSection', auth, isInstructor, updateSubSection);
router.delete('/deleteSubSection', auth, isInstructor, deleteSubSection);

router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRating);

module.exports = router;