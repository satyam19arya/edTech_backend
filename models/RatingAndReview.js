const mongoose = require('mongoose');

const ratingAndReview = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('RatingandReview', ratingAndReview);