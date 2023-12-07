const User = require('../models/User');
const OTP = require('../models/Otp');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendOtp = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                success: false,
                message: "User already exists"
            });
        }

        // Generate OTP
        const otp = otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            specialChars: false, 
            lowerCaseAlphabets: false
         });
        console.log("OTP generated", otp);

        // Make sure OTP is unique
        const result = await OTP.findOne({otp});
        while(result){
            console.log("OTP already exists");
            otp = otpGenerator.generate(6, { 
                upperCaseAlphabets: false, 
                specialChars: false, 
                lowerCaseAlphabets: false
             });
            console.log("OTP generated", otp);
        }

        const newOtp = new OTP({
            email,
            otp
        });

        await newOtp.save();

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
            email
        });

    } catch(err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
}

const signUp = async (req, res) => {
    try{
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
    
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
    
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                success: false,
                message: "User already exists"
            });
        }

        const response = await OTP.findOne({email}).sort({createdAt: -1}).limit(1);
        if(!response){
            return res.status(401).json({
                success: false,
                message: "OTP not found"
            });
        }

        if(response[0].otp !== otp){
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const additonalDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additonalDetails: additonalDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}+${lastName}&background=%23fff&radius=50`
        });

        await newUser.save();

        res.status(200).json({
            success: true,
            message: "User created successfully",
            user: newUser
        });

    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "User can't be created",
            error: err.message
        });
    }
}

const logIn = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User does not exist"
            });
        }

        const matched = await bcrypt.compare(password, user.password);
        if(!matched){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const accessToken = generateAccessToken({ email: user.email ,_id: user._id, accountType: user.accountType})
        const refreshToken = generateRefreshToken({ _id: user._id})

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true
        });

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            accessToken,
            user
        });
    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
}

const refreshAccessToken = async(req, res) => {
    const cookies = req.cookies;
    if(!cookies.jwt){
        return res.status(401).json({
            success: false,
            message: "Refresh token in cookie is required"
        });
    }

    const refreshToken = cookies.jwt;

    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
        const _id = decoded._id;
        const accessToken = generateAccessToken({_id});
        return res.status(201).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken
        });
    }catch(e){
        console.log(e);
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        });
    }
};

const logout = async (req, res) => {
    try{
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    }catch(e){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    }
};

const generateAccessToken = (data) => {
    try{
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {expiresIn: '1d'});
        return token;
    }catch(e){
        console.log(e);
    }
}

const generateRefreshToken = (data) => {
    try{
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {expiresIn: '1y'});
        return token;
    }catch(e){
        console.log(e);
    }
}

const changePassword = async (req, res) => {
    try{
        const userDetails = await User.findById(req.user._id);
        const {oldPassword, newPassword, confirmPassword} = req.body;

        if(!oldPassword || !newPassword || !confirmPassword){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const matched = await bcrypt.compare(oldPassword, userDetails.password);

        if(!matched){
            return res.status(401).json({
                success: false,
                message: "The password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, {password: hashedPassword}, {new: true});

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: err.message
        });
    }
}

module.exports = {
    sendOtp,
    signUp,
    logIn,
    logout,
    refreshAccessToken,
    changePassword
}