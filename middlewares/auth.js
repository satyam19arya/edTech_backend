const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
    console.log("I am inside midleware");
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
        return res.send(error(401, 'Authorization header is required'));
    }

    const accessToken = req.headers.authorization.split(" ")[1];

    try{
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
        const user = await User.findById(decoded._id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        req.user = user;
        next();
    } catch(err){
        return res.status(401).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType === 'Student'){
            next();
        } else{
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this route'
            })
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType === 'Instructor'){
            next();
        } else{
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this route'
            })
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType === 'Admin'){
            next();
        } else{
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this route'
            })
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}