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
const ejs = require('ejs');
const path = require('path');



//generate the QR code and send it to the user's email
//the data is in the request body
//trial
const generateQRCodeAndSendEmail = async (url,userId,email,ticketArray,total,firstName,lastName,subTotal,discountAmount,fees) => {

    let userName = firstName + " " + lastName;
    // //find the user by id from the id in the request
    let user = await User.findById(userId);
    // let userEmail = user.emailAddress;

    //sending the email to the one specified in the form instead
    let userEmail = email;

    //generate the QR code
    const qrImageName = await createQR(url);
    

    //create a string combining the environment variable and the QR code name
    // const qr = process.env.CURRENTURL + qrImageName;
    const qr ="http://ec2-3-219-197-102.compute-1.amazonaws.com/"+qrImageName;


    // // personalizedTemplate = template.replace('{{tickets}}', tickets);

    //using ejs to render the template
    ejs.renderFile('./views/email-template3.ejs', { ticketArray }, async (err, html) => {
        if (err) 
        {
            console.log('Error rendering EJS file:', err);
        } 
        else 
        {
            const parentDir = path.dirname(__dirname);
            const outputPath = path.join(parentDir, 'views', 'email-template-final.html');
            await fs.writeFile(outputPath, html, async (err) => 
            {
                if (err) 
                {
                    console.log('Error saving HTML file:', err);
            } 
            else 
            {
                    // console.log('HTML output saved to file:', outputPath);
                    //here I have the html file saved
                    const template=fs.readFileSync('./views/email-template-final.html','utf8');
                    // console.log("read the html file success")
                    const name = user.firstName;
                    const personalizedTemplate = await template.replace('{{name}}', userName).replace('{{subTotal}}', subTotal).replace('{{discountAmount}}', discountAmount).replace('{{fees}}', fees).replace('{{total}}', total);

                    // console.log("replaced the name success")
                
                    
                
                    const image=fs.readFileSync('./public/' + qrImageName);
                
                    //send the QR code to the user's email
                    await sendMailWithAttachment({
                        email: userEmail,
                        subject: 'QR Code',
                        attachments: [
                            // {
                            //     filename: "envie.png",
                            //     path: "./public/envie.png",
                            //     contentType: 'image/png',
                            //     content: image,
                            //     cid: 'envie'             
                            // }
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
                    // console.log("sent the email success")
                    // console.log("./public/" + qrImageName)
                
                    //delete the image file that was sent
                    fs.unlinkSync('./public/' + qrImageName);
                
                    //delete the output html file
                    fs.unlinkSync('./views/email-template-final.html');
                    //return res.status(200).json({ message: "QR code sent successfully!" });

            }
        });
        }
    });



}

module.exports = {generateQRCodeAndSendEmail};