// let express = require("express");
var {mailer,mailer2} = require('../functions/mailer');

var utils=require('../functions/utils');
var path = require('path');

var multer  = require('multer')
var upload = multer({ dest: __dirname+'/uploads/' })
var fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');


module.exports = function(router){
 
  
  router.post('/sendOtp',(req,res) =>{
    var email=req.body.Email
  function  genOTP (min, max)  {
      return Math.floor(min + Math.random() * max);
    }
  
  var otpVal=genOTP(100000, 900000);
  
  sendOTP( email,otpVal, (err, updatedUser) => {
      if (err) {
        res.status(400).send({
          status: false,
          message: err,
        });
      }
      else res.status(200).send({status:true, message:otpVal});
    })

   
  })  
  
  const sendOTP = ( recipient, otpVal, callback) => {
    mailer({
        email: recipient,
       otpVal
      }, result => {
        if (result && result.status == 1000) {
            console.log("Otp Sent!");
            callback(null)
         
        } else {
          callback("Unable to send OTP through email", null)
        }
      });   
  }

  router.post('/uploadPdf', upload.any() ,(req,res) =>{
    var receipt=req.files[0];
    receipt.filename="12";
       
          var oldpath = receipt.path;
          console.log(oldpath);
          var newpath = __dirname+oldpath;
          console.log(newpath);
          fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.write('File uploaded and moved!');
            res.end();
          });
  })
  //verify OTP api
   router.post('/sendPdf', upload.any() ,(req,res) =>{
var email='robinsinghmahrok@gmail.com';  
 var billerId=Math.random();
var customerName='Jenofer Lopez';
var receiptId=Math.random();
//Attachment
var receipt=req.files[0];
receipt.filename="12";
console.log(receipt)
sendReceipt(  email,
  billerId,customerName,receiptId,receipt, (err, updatedUser) => {
  if (err) {
    res.status(400).send({
      status: false,
      message: err,
    });
  }
  else res.status(200).send({status:true, message:"Sent"});
})

   })

   const sendReceipt = (email,
    billerId,customerName,receiptId,receipt, callback) => {
  mailer2({
    email,
   billerId,customerName,receiptId,receipt
  }, result => {
    if (result && result.status == 1000) {
        console.log("Otp Sent!");
        callback(null)
     
    } else {
      callback("Unable to send OTP through email", null)
    }
  }); 
  } 
   
   
  
  }
