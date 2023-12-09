const {contactUsEmail} = require('../utils/templates/contactFormTemplate');
const mailSender = require('../utils/mailSender');

const contactUs = async (req, res) => {
    try{
        const {
            firstName,
            lastName,
            email,
            phoneNo,
            countrycode,
            message
        } = req.body;

        if(!firstName || !lastName || !email || !phoneNo || !countrycode || !message){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        await mailSender(email ,"Your Data send successfully" ,contactUsEmail(firstName, lastName, email, phoneNo, countrycode, message));

        res.status(200).json({
            success: true,
            message: "Email send successfully"
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
    contactUs
}