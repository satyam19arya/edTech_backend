const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mailSender = require('../utils/mailSender');

const resetPasswordToken = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
    
        const token = crypto.randomBytes(20).toString('hex');

        const updatedDetails = await User.findOneAndUpdate(
            { email },    // filter by email
            { resetPasswordToken: token, resetPasswordExpire: Date.now() + 3600000 }, 
            { new: true }  // new: true returns the updated document
        );
    
        const url = `http://localhost:3000/update-password/${token}`;
        const message = `Click on the link below to reset your password:\n\n${url}`;

        await mailSender({
            email: user.email,
            subject: 'Reset Password',
            message
        });

        res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        })

    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        })
    }
}

const resetPassword = async (req, res) => {
    try{
        const {password, confirmPassword, resetPasswordToken} = req.body;
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            })
        }

        const user = await User.findOne({ resetPasswordToken });
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'Invalid token'
            })
        }

        if(Date.now() > user.resetPasswordExpire){
            return res.status(400).json({
                success: false,
                message: 'Token expired, Please regenerate token'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            { resetPasswordToken },
            { password: hashedPassword, resetPasswordToken: null, resetPasswordExpire: null }, 
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        })

    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: err.message
        })
    }
}

module.exports = {
    resetPasswordToken,
    resetPassword
}