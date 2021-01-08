// "use strict";
/**
 *@description mailer file
 *@author Tilak
 *@since April 03, 2020
 */

const nodemailer = require("nodemailer");
const EMAIL_USERNAME= 'yaassmobileapp@gmail.com';
const COMMON_NAME = 'Panch Pandav';
const { 
    credentials,
    token
} = require('../config/config');


const mailSettings = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',
    from: `"${COMMON_NAME}"`, 
    auth: {
        //OAuth2 details added
        type: 'OAuth2',
		user: EMAIL_USERNAME,
		clientId: credentials.web.client_id,
		clientSecret: credentials.web.client_secret,
		refreshToken: token.refresh_token,
		accessToken: token.access_token,
		expires: token.expiry_date
    },
    tls: {
        rejectUnauthorized: false
    }
};
let transporter = nodemailer.createTransport(mailSettings);

const mailer = (data, cb) => {
    let mailOptions = {
        from: '"Panch Pandav" <' + mailSettings.auth.user + ">",
        to: data.email,
        subject: "OTP verification",
        html: "<h1>Hello</h1><p>Your OTP is : </p><b>" + data.otpVal + "</b>" // html body
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
            cb({ status: 1001 });
        } else {
            
            cb({ status: 1000 });
        }
    });
};

const mailer2 = (data, cb) => {
    let mailOptions = {
        from: '"Panch Pandav" <' + mailSettings.auth.user + ">",
        to: data.email,
        subject: "Your Order Details",
        html: "<h1>Greetings from "+data.restraw+"</h1><p>Your Order Number is : </p><b><h2>" + data.otpVal + "</h2></b>" +"<p> And Your Items are : </p><b>" + data.Items + "</b>"+
        "<p> And Total Amount is : Rs.<b>" + data.price + "</b></p>"
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
            cb({ status: 1001 });
        } else {
            cb({ status: 1000 });
        }
    });
};

const mailer3 = (data, cb) => {
    let mailOptions = {
        from: '"Panch Pandav" <' + mailSettings.auth.user + ">",
        to: data.email,
        subject: "Your Order Is "+data.status1,
        html: "<h1>Hello</h1><p>Your Order is <b>"+data.status1 +" </b>from Order Number : <b></p>"+data.orderNo+"</b>"
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
            cb({ status: 1001 });
        } else {
            cb({ status: 1000 });
        }
    });
};

const mailer4 = (data, cb) => {
    let mailOptions = {
        from: '"Panch Pandav" <' + mailSettings.auth.user + ">",
        to: data.email,
        subject: "Your Order Details",
        html: "<h1>Hello</h1><p>Your Order Number is : </p><b><h2>" + data.otpVal + "</h2></b>" +"<p> And Your Items are : </p><b>" + data.Items + "</b>"+
        "<p> And Total Amount is : Rs.<h3><b>" + data.price + "</h3></b></p>"
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
            cb({ status: 1001 });
        } else {
            cb({ status: 1000 });
        }
    });
};

module.exports ={mailer,mailer2,mailer3,mailer4};
//module.exports=mailer2;

