const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    },
});

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, 'Verification Email', otp);
        console.log("Email sent successfylly: ",mailResponse.response);

    } catch(e){
        console.log(e);
        throw e;
    }
}

otpSchema.pre('save', async function(next) {
    try {
        if(this.isNew) await sendVerificationEmail(this.email, this.otp);
        next();
    } catch(e){
        console.log(e);
        throw e;
    }
});

module.exports = mongoose.model('Otp', otpSchema);