const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    desciption: {
        type: String,
        trim: true
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]
});

module.exports = mongoose.model('Category', categorySchema);