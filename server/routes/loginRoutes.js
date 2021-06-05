// let express = require("express");
var { mailer, mailer2 } = require("../functions/mailer");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: __dirname + "\\uploads\\",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });


module.exports = function (router) {
  router.post("/sendOtp", (req, res) => {
    var email = req.body.Email;
    function genOTP(min, max) {
      return Math.floor(min + Math.random() * max);
    }

    var otpVal = genOTP(100000, 900000);

    sendOTP(email, otpVal, (err, updatedUser) => {
      if (err) {
        res.status(400).send({
          status: false,
          message: err,
        });
      } else res.status(200).send({ status: true, message: otpVal });
    });
  });

  const sendOTP = (recipient, otpVal, callback) => {
    mailer(
      {
        email: recipient,
        otpVal,
      },
      (result) => {
        if (result && result.status == 1000) {
          console.log("Otp Sent!");
          callback(null);
        } else {
          callback("Unable to send OTP through email", null);
        }
      }
    );
  };

  // router.post('/uploadPdf', upload.any() ,(req,res) =>{
  //   var email=req.body.receiverEmail;
  // var subject=req.body.subject;
  // var message=req.body.message;
  //   var receipt=req.body.fileToUpload;
  //   receipt.filename="12";

  //         var oldpath = receipt.path;
  //         console.log(oldpath);
  //         var newpath = __dirname+oldpath;
  //         console.log(newpath);
  //         fs.rename(oldpath, newpath, function (err) {
  //           if (err) throw err;
  //           res.write('File uploaded and moved!');
  //           res.end();
  //         });
  // })

  //Send attachment api
  router.post("/sendPdf", upload.any(), (req, res) => {
    var email = req.headers.receiveremail;
    var subject = req.headers.subject;
    var message = req.headers.message;

    //Attachment
    var receipt = req.files[0];

    sendReceipt(
      email,
      billerId,
      customerName,
      receipt,
      subject,
      message,
      (err, updatedUser) => {
        if (err) {
          res.status(400).send({
            status: false,
            message: err,
          });
        } else res.status(200).send({ status: true, message: "Sent" });
      }
    );
  });

  const sendReceipt = (
    email,
    billerId,
    customerName,
    receipt,
    subject,
    message,
    callback
  ) => {
    mailer2(
      {
        email,
        billerId,
        customerName,
        receipt,
        subject,
        message,
      },
      (result) => {
        if (result && result.status == 1000) {
          console.log("Otp Sent!");
          callback(null);
        } else {
          callback("Unable to send OTP through email", null);
        }
      }
    );
  };
};
