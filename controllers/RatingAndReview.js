const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');

const createRating = async (req, res) => {
    try{
        const userId = req.user._id;
        const {rating, review, courseId} = req.body;

        if(!rating || !review || !courseId){
            return res.status(400).json({
                success: false,
                message: 'Please fill all the required fields'
            });
        }

        // Check if user is enrolled in the course or not
        const course = await Course.findById(
            {_id: courseId},
            {enrolledUsers: {$elemMatch: {$eq: userId}}}
        );

        if(!course){
            return res.status(400).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        // Check if user has already rated the course
        const ratingAndReview = await RatingAndReview.findOne({
            userId: userId,
            courseId: courseId
        });

        if(ratingAndReview){
            return res.status(400).json({
                success: false,
                message: 'You have already rated this course'
            });
        }

        const newRatingAndReview = new RatingAndReview({
            user: userId,
            course: courseId,
            rating: rating,
            review: review
        });

        await newRatingAndReview.save();

        // Update course with new rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id: courseId},
            {
                $push: {
                    ratingAndReviews: newRatingAndReview._id
                }
            },
            {new: true}
        )

        return res.status(200).json({
            success: true,
            message: 'Rating and review added successfully',
            ratingAndReview: newRatingAndReview
        });

    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        })
    }  
}

const getAverageRating = async (req, res) => {
    try{
        const {courseId} = req.body;

        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)  // Convert string to ObjectId
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: '$rating'}
                }
            }
        ]);

        if(result.length > 0){
            return res.status(200).json({
                success: true,
                message: 'Average rating fetched successfully',
                averageRating: result[0].averageRating  // result will be an array of objects
            });
        }

        return res.status(200).json({
            success: true,
            message: 'No rating found',
            averageRating: 0
        });
    
    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        })
    }
}

const getAllRating = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                 .sort({rating: 'desc'})
                                 .populate({
                                    path: 'user',
                                    select: 'firstName lastName email image'
                                 })
                                .populate({
                                    path: 'course',
                                    select: 'courseName'
                                })
                                .exec();
        
        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            reviews: allReviews
        });

    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        })
    }
}

module.exports = {
    createRating,
    getAverageRating,
    getAllRating
}