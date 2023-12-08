const {instance} = require("../utils/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const crypto = require("crypto");
const mainSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const {courseEnrollmentEmail} = require("../utils/templates/courseEnrollmentEmail");
const {paymentSuccessEmail} = require("../utils/templates/paymentSuccessEmail");

const capturePayment = async (req, res) => {
    try{
        const { course_id } = req.body;
        const userId = req.user._id;

        if(course_id.length === 0 || !course_id){
            return res.status(400).json({
                success: false,
                message: "Please provide course id"
            })
        }

        const course = await Course.findById(course_id);

        if(!course){
            return res.status(400).json({
                success: false,
                message: "Invalid course id"
            })
        }

        // Check if user already enrolled in the course
        const uid = mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course"
            })
        }

        // Create order
        const amount = course.price * 100;
        const currency = "INR";

        const options = {
            amount,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: course_id,
                userId: userId
            }
        }

        const order = await instance.orders.create(options);
        console.log(order);

        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            courseName: course.courseName
        })

    } catch(err){
        console.log(err);
        res.status(500).json({
            message: "Could not initiate order"
        })
    }
}

// Verify signature of Razorpay and Server
const verifySignature = async (req, res) => {
    const razorpay_order_id = req.body.razorpay_order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id;
    const razorpay_signature = req.body.razorpay_signature;
    const userId = req.user._id;
    const courses = req.body.courses;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !courses){
        return res.status(400).json({
            success: false,
            message: "Payment failed"
        })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
                                    .update(body.toString())
                                    .digest("hex");

    if(expectedSignature !== razorpay_signature){
        return res.status(400).json({
            success: false,
            message: "Unauthorized payment"
        })
    }

    if(expectedSignature === razorpay_signature){
        await enrollStudents(userId, courses, res);
        return res.status(200).json({
            success: true,
            message: "Payment successful"
        })
    }

    return res.status(400).json({
        success: false,
        message: "Payment failed"
    })
}

const enrollStudents = async (userId, courses, res) => {
    if(!userId || !courses){
        return res.status(400).json({
            success: false,
            message: "Payment failed"
        })
    }
}

const sendPaymentSuccessEmail = async (req, res) => {
    try{
        const { orderId, paymentId, amount } = req.body;
        const userId = req.user._id;

        if(!orderId || !paymentId || !amount){
            return res.status(400).json({
                success: false,
                message: "Please provide all the details"   
            })
        }

        const student = await User.findById(userId);

        if(!student){
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            })
        }

        await mainSender(
            student.email,
            `Payment Success`,
            paymentSuccessEmail(`${student.firstName} ${student.lastName}`, amount/100, orderId, paymentId)
        )

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Could not send email"
        })
    }
}

module.exports = {
    capturePayment,
    verifySignature,
    sendPaymentSuccessEmail
}