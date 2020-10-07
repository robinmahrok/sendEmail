const shorturl = require('../models/shorturl');
const express = require("express");
const studentInfo = require('../models/studentInfo');
var saltRounds = 10;
var crypto = require('crypto'); 
var mailer = require('../functions/mailer');
const { models } = require('mongoose');
router = express.Router();
  
  router.get('/', async (req, res) =>{
    const shorturls = await shorturl.find().sort({clicks: -1});
    res.render('index');
    });


//signup api
router.post('/signup',   (req,res)=>{
        var name=req.body.name, email = req.body.email,
        password=req.body.password;
        if (req.body.name == null || typeof req.body.name == undefined || req.body.name == "") {
            res.status(400).send({ status: false, message: "Please enter firstName" });
          } else if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ||
            req.body.password == null || typeof req.body.password == undefined || req.body.password.length == 0) {
            res.status(400).send({ status: false, message: "Email or Password is missing, Please enter." });
            }

//password check with Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character
function passwordCheck (password1) {
    // return (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*?]{6,}$/).test(password)
    return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/).test(password1)
  };


// checking password criteria  
if(!!passwordCheck(password))
{//creating hash for password
    saltRounds = crypto.randomBytes(16).toString('hex'); 
  
    // Hashing user's salt and password with 1000 iterations, 
    password1 = crypto.pbkdf2Sync(password, saltRounds, 1000, 64, `sha512`).toString(`hex`); 

}
else res.status(400).send("Password does not met criteria");
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
  })
//sending data in database
 studentInfo.create({Name: name, Email : email , Password:password1 , OtpVerify:"Pending", Otp:otpVal});
 if(studentInfo.create())
 res.status(200).send("sent");
    })
//signup api end



const sendOTP = ( recipient, otpVal, callback) => {
    mailer({
        email: recipient,
       otpVal
      }, result => {
        if (result && result.status == 1000) {
            console.log("Otp Sent!");
         
        } else {
          callback("Unable to send OTP through email", null)
        }
      });
    
  }
var globalEmail="";

//send and update otp in database api
router.post('/sendOtp',(req,res) =>{
    var email = req.body.email
globalEmail=email;

   if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ) 
   {
        res.status(400).send({ status: false, message: "Email is missing, Please enter." });
    }

    studentInfo.getUserByEmail(email, (err, user) => {
        if (err || !user) {
          res.status(400).send({ status: false, message: "User not found" });
        } else {
         
            function  genOTP (min, max)  {
                return Math.floor(min + Math.random() * max);
              }
            
            var otpVal=genOTP(100000, 900000);
            sendOTP( email, otpVal, (err) => {
              if (err) {
                res.status(400).send({
                  status: false,
                  message: err,
                });
            }
            })
            studentInfo.updateOTP(email, otpVal, (err, updatedUser) => {
                if (err) {
                  res.status(400).send({
                    status: false,
                    message: err,
                  });
                }
                else
                {
                    res.status(200).send({ status: true,message:"Sent"});
                }
              })
        }
    })
});
    
//verify OTP api
 router.post('/otpVerify',(req,res) =>{
     
    var userotp=req.body.otp;
studentInfo
    .find({ Email: globalEmail, Otp:userotp })
    .then(data => {
      companyDet = data;
      if (companyDet.length == 0) {
      res.status(400).send({ status: false, message: "Otp mismatch" });
      }
    else{
                //update verified in otpVerify
                    studentInfo.updateOne({ Email: globalEmail }, { OtpVerify: "Verified" }, function (err, otpVerified) {
                        if (err)
                         res.status(400).send({ status: false, message: "Unable to update User data" });
                         else 
                          res.status(200).send({status: true, message: "Otp Verified successfully"});
                            });
                        }    
            })
        })

    // change password api
router.post('/forgotPassword',(req,res) =>{

    var userpass=req.body.password;
                //password check with Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character
                function passwordCheck (password1) {
                     return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/).test(password1)
                    }


                // checking password criteria  
                if(!!passwordCheck(userpass))
                    {//creating hash for password
                        saltRounds = crypto.randomBytes(16).toString('hex'); 
  
                            // Hashing user's salt and password with 1000 iterations, 
                        password1 = crypto.pbkdf2Sync(userpass, saltRounds, 1000, 64, `sha512`).toString(`hex`); 

                    }




                 // Update password with hash value
                 studentInfo.updateOne({ Email: globalEmail }, { Password: password1 }, function (err, passwordUpdate) {
                    if (err) res.status(400).send({ status: false, message: "Unable to update User data" });
                    else passwordUpdate.length != 0;
                    {
                      var result = {
                        status: true,
                        message: "Your Password Updated successfully."
                      };
                      res.status(200).send(result);
                    }
                  });
        });
  




router.get('/register', (req, res) =>{
    res.render('register');
    });

module.exports = function (app) {
    app.use("/", router);
  };