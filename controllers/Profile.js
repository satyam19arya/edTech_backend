const Profile = require('../models/Profile');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

const updateProfile = async (req, res) => {
    try{
        const {
            firstName,
            lastName,
            dateOfBirth,
            about,
            contactNumber,
            gender,
        } = req.body;

        const id = req.user._id;

        if(!contactNumber || !gender || !dateOfBirth){
            return res.status(400).json({
                success: false,
                message: 'Please fill all the required fields'
            });
        }

        const userDetails = await User.findById(id);
        const profile = await Profile.findById(userDetails.additionalDetails);

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        }, {new: true})

        await user.save();

        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;
        profile.gender = gender;

        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const deleteProfile = async (req, res) => {
    try{
        const id = req.user._id;
        const userDetails = await User.findById(id);

        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const profile = await Profile.findById(userDetails.additionalDetails);

        await User.findByIdAndDelete(id);
        await Profile.findByIdAndDelete(profile._id);

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        });

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getAllUserDetails = async (req, res) => {
    try{
        const id = req.user._id;
        const userDetails = await User.findById(id)
                                      .populate('additionalDetails')
                                      .exec();

        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User details fetched successfully',
            data: userDetails
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const updateDisplayPicture = async (req, res) => {
    try{
        const displayPicture = req.files.displayPicture;
        const id = req.user._id;
        const userDetails = await User.findById(id);

        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        const result = await cloudinary.uploader.upload(displayPicture.tempFilePath, {
            folder: 'FileUpload',
            crop: 'scale',
        });

        const updatedProfile = await User.findByIdAndUpdate(
            {_id: id},
            {image: result.secure_url},
            {new: true}
        )

        res.status(200).json({
            success: true,
            message: 'Display picture updated successfully',
            data: updatedProfile
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

const getEnrolledCourses = async (req, res) => {}

const instructorDashboard = async (req, res) => {}

module.exports = {
    updateProfile,
    deleteProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard
}