const shorturl = require('../models/shorturl');
const express = require("express");
const studentInfo = require('../models/studentInfo');
var saltRounds = 10;
var crypto = require('crypto'); 
var mailer = require('../functions/mailer');
router = express.Router();
  router.use(express.urlencoded({extended: false}));
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
           //generate Otp
 
const em={Email : recipient};
const ot={Otp: otpVal};
    mailer({
        email: recipient,
       otpVal
      }, result => {
        if (result && result.status == 1000) {
            studentInfo.findOneAndUpdate({ em },{ ot } , { new: true });
         
        } else {
          callback("Unable to send OTP through email", null)
        }
      });
    
  }


//otp verify api

router.post('/otpverify',(req,res) =>{
    var { body: { email, otp } } = req;
    const conditions = [{ email }, { otp }]
    if (isSignup) {
      conditions.push({ otpVerify: "Pending" })
    } else {
      conditions.push({ otpVerify: "Verified" })
    }
    models.register.find({ $and: conditions },
      function (err, users) {
        if (err) {
          res.status(400).send({
            status: false,
            message: "Error while getting user details",
          });
        }
        else {
          if (users.length != 0) {
            let user = users[0]
            // Upsert new device token
            models.userToken.setUserToken(user._id, deviceToken, (err, token) => {
              if (err) {
                res.status(400).send({
                  status: false,
                  message: "Error while storing device token",
                });
              } else {
                // To get JWT token based user Data
                const token = getLoginToken({
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  name: user.name,
                  email: user.email,
                  date: Date.now()
                })
                if (isSignup) {
                  models.register.findOneAndUpdate(
                    { email: email, otp: req.body.otp },
                    { $set: { otpVerify: "Verified" } },
                    { new: true },
                    function (err, updatedUser) {
                      if (err) {
                        res.status(400).send({
                          status: false,
                          message: "Error while updating user details",
                        });
                      }
                      else {
                        res.status(200).send({
                          status: true,
                          message: "OTP verified successfully",
                          result: { token, user: updatedUser }
                        });
                      }
                    }
                  );
                } else {
                  res.status(200).send({
                    status: true,
                    message: "OTP verified successfully",
                    result: { token, user }
                  });
                }
              }
            })
          } else {
            res.status(400).send({
              status: false,
              message: "Somethimg Wrong.Your OTP is miss Match",
            });
          }
        }
      }
    );
})



    router.get('/:shortUrl', async (req, res) =>{
    const ShortUrl= await shorturl.findOne({short: req.params.shortUrl});
    if(ShortUrl == null)
    return res.sendStatus(404);
    //console.log(shortUrl);
    ShortUrl.clicks++
    ShortUrl.save();
    res.redirect(ShortUrl.full);
    });
    
module.exports = function (app) {
    app.use("/", router);
  };