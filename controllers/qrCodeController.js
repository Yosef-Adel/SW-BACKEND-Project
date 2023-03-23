//require the qrcode package
const QRCode = require('qrcode');
//require the nodemailer package
const nodemailer = require('nodemailer');
//require the createQR function
const {createQR} = require('../utils/createQR');
//require the user model
const User = require('../models/User');
//require the sendEmail function
const sendEmail = require('../utils/emailVerification');


//generate the QR code and send it to the user's email
//the data is in the request body
//trial
const generateQRCodeAndSendEmail = async (req, res) => {
    //check if the user is logged in
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //find the user by id from the id in the request
    let user = await User.findById(req.user._id);
    let userEmail = user.emailAddress;
    console.log(userEmail);

    //generate the QR code
    const qr = await createQR(req.body.data);
    //send the QR code to the user's email
    await sendEmail({
        email: userEmail,
        subject: 'QR Code',
        message: 'Here is your QR code',
    })

    res.status(200).json({ message: "QR code sent successfully!" });

}

module.exports = {generateQRCodeAndSendEmail};