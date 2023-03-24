const nodemailer = require("nodemailer");


const sendMail = async options => {
  const transporter = nodemailer.createTransport({
    service:'gmail',
    host:'smtp.gmail.com',
    port:'465',
    secure: true, // use SSL
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS
    }
  });

  const mailOptions = {
    from: 'Envie Support <support@envie.me>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
};

const sendMailWithAttachment = async options => {
  const transporter = nodemailer.createTransport({
    service:'gmail',
    host:'smtp.gmail.com',
    port:'465',
    secure: true, // use SSL
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS
    }
  });

  const mailOptions = {
    from: 'Envie Support <support@envie.me>',
    to: options.email,
    subject: options.subject,
    html: options.html
    // attachments: [
    //   {
    //     filename: options.filename,
    //     path: options.path,
    //     contentType: options.contentType,
    //     content: options.content
    //   }
    // ]
};
await transporter.sendMail(mailOptions);
};

module.exports = {sendMail, sendMailWithAttachment};

//testing transporter
// transporter.verify((error, success)=> {
//     if (error)
//     {
//         console.log(error);
//     }
//     else{
//         console.log("transporter ready to send emails");
//         console.log(success);
//     }
// });
