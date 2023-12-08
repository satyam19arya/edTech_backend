const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

const createCourse = async (req, res) => {
    try{
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            instructions
        } = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!thumbnail){
            return res.status(400).json({
                success: false,
                message: "Thumbnail is required"
            });
        }

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !instructions){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const userId = req.user._id;
        const instructorDetails = await User.findById(userId);

        if(!instructorDetails){
            return res.status(400).json({
                success: false,
                message: "Instructor not found"
            });
        }

        if(instructorDetails.role !== 'Instructor'){
            return res.status(400).json({
                success: false,
                message: "You are not authorized to create a course"
            });
        }

        // Check given category exists or not
        const categoryDetails = await Category.findById(category);

        if(!categoryDetails){
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }

        // Upload thumbnail to cloudinary
        const uploadedResponse = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
            folder: 'FileUpload',
            width: 500,
            crop: 'scale'
        });

        const newCourse = new Course({
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            thumbnail: uploadedResponse.secure_url,
            category: categoryDetails._id,
            instructions,
            instructor: instructorDetails._id
        });

        const savedCourse = await newCourse.save();

        // Add course to instructor's courses
        await User.findByIdAndUpdate({_id: instructorDetails._id}, {
            $push: {
                courses: savedCourse._id
            }
        },
        {new: true}
        );

        // Update category's schema
        await Category.findByIdAndUpdate({_id: categoryDetails._id}, {
            $push: {
                courses: savedCourse._id
            }
        },
        {new: true}
        );

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: savedCourse
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const editCourse = async (req, res) => {
    try{
        const { courseId } = req.body;
        const existingCourse = await Course.findById(courseId);

        if(!existingCourse){
            return res.status(400).json({
                success: false,
                message: "Course not found"
            });
        }

        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            instructions
        } = req.body;

        const thumbnail = req.files.thumbnailImage;

        // Update course details
        if(courseName) existingCourse.courseName = courseName;
        if(courseDescription) existingCourse.courseDescription = courseDescription;
        if(whatYouWillLearn) existingCourse.whatYouWillLearn = whatYouWillLearn;
        if(price) existingCourse.price = price;
        if(category) existingCourse.category = category;
        if(instructions) existingCourse.instructions = instructions;
        
        if(thumbnail){
            const uploadedResponse = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
                folder: 'FileUpload',
                width: 500,
                crop: 'scale'
            });

            existingCourse.thumbnail = uploadedResponse.secure_url;
        }

        const updatedCourse = await existingCourse.save();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

const getAllCourses = async (req, res) => {
    try{
        const courses = await Course.find({});

        if(!courses){
            return res.status(400).json({
                success: false,
                message: "No courses found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: courses
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    createCourse,
    editCourse,
    getAllCourses
}