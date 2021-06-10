
const nodemailer = require("nodemailer");
const EMAIL_USERNAME = "yaassmobileapp@gmail.com";
const COMMON_NAME = "Smart Mail";
const { credentials, token } = require("../config/config");

const mailSettings = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",
  from: `"${COMMON_NAME}"`,
  auth: {
    //OAuth2 details added
    type: "OAuth2",
    user: EMAIL_USERNAME,
    clientId: credentials.web.client_id,
    clientSecret: credentials.web.client_secret,
    refreshToken: token.refresh_token,
    accessToken: token.access_token,
    expires: token.expiry_date,
  },
  tls: {
    rejectUnauthorized: false,
  },
};
let transporter = nodemailer.createTransport(mailSettings);

const mailer = (data, cb) => {
  let mailOptions = {
    from: '"Smart Mail" <' + mailSettings.auth.user + ">",
    to: data.email,
    subject: "OTP verification",
    html: "<h1>Hello</h1><p>Your OTP is : </p><b>" + data.otpVal + "</b>", // html body
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
    from: '"Smart Mail" <' + mailSettings.auth.user + ">",
    to: data.email,
    subject: "" + data.subject,
    html: data.message,
    attachments: [
      {
        filename: data.receipt.originalname,
        path: data.receipt.path,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      cb({ status: 1001 });
    } else {
      console.log(mailOptions);

      cb({ status: 1000 });
    }
  });
};

const mailer3 = (data, cb) => {
  let mailOptions = {
    from: '"Smart Mail" <' + mailSettings.auth.user + ">",
    to: data.email,
    subject: "" + data.subject,
    html: data.message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      cb({ status: 1001 });
    } else {
      console.log(mailOptions);

      cb({ status: 1000 });
    }
  });
};

module.exports = { mailer, mailer2,mailer3 };
