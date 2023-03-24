//require the qrcode package
const QRCode = require('qrcode');
//require the nodemailer package
const nodemailer = require('nodemailer');
//require the createQR function
const {createQR} = require('../utils/createQR');
//require the user model
const User = require('../models/User');
//require the sendEmail function
const {sendMailWithAttachment} = require('../utils/emailVerification');


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
    const qrImageName = await createQR(req.body.data);

    //create a string combining the environment variable and the QR code name
    const qr = process.env.CURRENTURL + qrImageName;

    //send the QR code to the user's email
    await sendMailWithAttachment({
        email: userEmail,
        subject: 'QR Code',
        // html: '<p>Please find the QR code below:</p>',
        // attachments: [
        //     {
        //         filename: qrImageName,
        //         path: "./public/" + qrImageName,
        //         contentType: 'image/png'
        //     }
        // ]
        html:'<p>Please find the QR code below:</p><br><img src="' + qr + '" alt="QrCode" title="QrCode" style="display:block" width="200" height="200" />'
        
    })
    await user.save();

    return res.status(200).json({ message: "QR code sent successfully!" });

}

module.exports = {generateQRCodeAndSendEmail};