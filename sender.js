const nodemailer = require("nodemailer");
const merge = require("lodash/merge");

const emailSender = emailParams => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'strigkov26@gmail.com', // generated ethereal user
            pass: 'Kramatorsk26031991', // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    // setup email data with unicode symbols
    let mailOptions = merge({}, {
        from: "'Artem Strizhkov' <strigkov26@gmail.com>", // sender address
        to: 'artemstrigkov@gmail.com', // list of receivers
        subject: 'Information', // Subject line
        text: 'Hello world?', // plain text body
        html: 'Hi', // html body
    }, emailParams);

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
};

module.exports = emailSender;
