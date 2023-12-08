const Section = require('../models/Section');
const Course = require('../models/Course');

const createSection = async (req, res) => {
    try{
        const { sectionName,  courseId } = req.body;
        const course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            })
        }

        if(!sectionName || courseId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields'
            })
        }

        const section = new Section({
            sectionName,
        });

        await section.save();

        await Course.findByIdAndUpdate(courseId, {
            $push: {
                courseContent: section._id
            }
        }, {
            new: true,
        })

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            section
        })

    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error creating section',
            error: error.message
        })
    }
}

const updateSection = async (req, res) => {
    try{
        const { sectionName, sectionId } = req.body;
        if(!sectionId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields'
            })
        }

        const section = await Section.findById(sectionId);
        if(!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            })
        }

        await Section.findByIdAndUpdate(sectionId, {
            sectionName
        }, {
            new: true,
        })

        res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            section
        })

    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error updating section',
            error: error.message
        })
    }
}

const deleteSection = async (req, res) => {
    try{
        const { sectionId } = req.body;
        if(!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields'
            })
        }

        const section = await Section.findById(sectionId);
        if(!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found'
            })
        }

        await Section.findByIdAndDelete(sectionId);

        res.status(200).json({
            success: true,
            message: 'Section deleted successfully',
            section
        })

    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting section',
            error: error.message
        })
    }
}

module.exports = {
    createSection,
    updateSection,
    deleteSection
}