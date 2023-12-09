const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const cloudinary = require('cloudinary').v2;

const createSubSection = async (req, res) => {
    try{
        const { title, description, sectionId } = req.body;
        const video = req.files.videoFile;

        if(!title || !description || !sectionId || !video) {
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

        // Upload video to cloudinary
        const uploadedVideo = await cloudinary.uploader.upload(video.tempFilePath, {
            resource_type: 'video',
            folder: 'FileUpload'
        });

        const subSection = await SubSection.create({
            title,
            description,
            video: uploadedVideo.secure_url,
            timeDuration: `${uploadedVideo.duration}`
        })

        await Section.findByIdAndUpdate(sectionId, {
            $push: {
                subSections: subSection._id
            }
        }, {
            new: true,
        })

        res.status(201).json({
            success: true,
            message: 'Sub section created successfully',
            subSection
        })

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error creating sub section',
            error: error.message
        })
    }
}

const updateSubSection = async (req, res) => {
    try{

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error updating sub section',
            error: error.message
        })
    }
}

const deleteSubSection = async (req, res) => {
    try{
        const { subSectionId } = req.body;

        if(!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields'
            })
        }

        const subSection = await SubSection.findById(subSectionId);
        if(!subSection) {
            return res.status(404).json({
                success: false,
                message: 'Sub section not found'
            })
        }

        await SubSection.findByIdAndDelete(subSectionId);

        res.status(200).json({
            success: true,
            message: 'Sub section deleted successfully'
        })

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting sub section',
            error: error.message
        })
    }
}

module.exports = {
    createSubSection,
    updateSubSection,
    deleteSubSection
}