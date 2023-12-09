const Profile = require('../models/Profile');
const User = require('../models/User');

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

        if(!contactNumber || !gender || dateOfBirth || !id){
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
            message: 'Profile updated successfully'
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
        const userDetails = await User.findById(id).populate('additionalDetails').exec();

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

const updateDisplayPicture = async (req, res) => {}

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