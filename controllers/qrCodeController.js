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
const fs = require('fs');


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

    //generate the QR code
    const qrImageName = await createQR(req.body.url);
    

    //create a string combining the environment variable and the QR code name
    const qr = process.env.CURRENTURL + qrImageName;

    const template=fs.readFileSync('./views/email-template.html','utf8');
    const name = user.firstName;
    const personalizedTemplate = template.replace('{{name}}', name);


    const image=fs.readFileSync('./public/' + qrImageName);

    //send the QR code to the user's email
    await sendMailWithAttachment({
        email: userEmail,
        subject: 'QR Code',
        attachments: [
            {
                filename: qrImageName,
                path: "./public/" + qrImageName,
                contentType: 'image/png',
                content: image,
                cid: 'image'
            }
        ],
        html: personalizedTemplate,
    })
    await user.save();

    //delete the image file that was sent
    fs.unlinkSync('./public/' + qrImageName);


    return res.status(200).json({ message: "QR code sent successfully!" });

}

module.exports = {generateQRCodeAndSendEmail};