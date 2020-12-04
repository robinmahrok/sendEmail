const express = require("express");
const studentInfo = require('../models/studentInfo');
var mailer = require('../functions/mailer');
var utils=require('../functions/utils');
const { models } = require('mongoose');
router = express.Router();
var globalEmail=""; 
const orderInfo = require('../models/orderInfo');

router.get('/', async (req, res) =>{
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

    globalEmail=email;

//password check with Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character
function passwordCheck (password1) {
    return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/).test(password1)
  };

  function emailCheck (password1) {
    return (/^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@stu.upes.ac.in$/).test(password1)
  };
  var hashedpass=""

  studentInfo.getUserByEmail(email, (err, user) => {
    if (err || !user) {
      //res.status(200).send({ status: true, message: "User not found" });
   
// checking email and password criteria
if(!!emailCheck(email))
{  
if(!!passwordCheck(password))
{
   utils.generateHash(password, function (err, hash) {
    if (!err && hash) {
      hashedpass = hash
   
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
    studentInfo.create({Name: name, Email : email , Password:hashedpass , OtpVerify:"Pending", Otp:otpVal});
    if(studentInfo.create())
    res.redirect('/otphtml');
}
else{
    res.status(400).send({ status:false, message:"Hash not created"});
}
})

}
else { //res.status(400).send({status:false , message:"Password does not met criteria"});
res.redirect('/register');
}
}
else {//res.status(400).send({status:false , message:"Email does not met criteria"});
res.redirect('/register');
}

} else {
  res.status(400).send({ status:false, message:"User Already Exists"});
}
  })
})  //signup api end


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


//send and update otp in database api
router.post('/sendOtp',(req,res) =>{
    var email = req.body.email
globalEmail=email;

   if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ) 
   {
        res.status(400).send({ status: false, message: "Email is missing, Please enter." });
    }
else{
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
                    message: err
                  });
                }
                else
                {
                   res.redirect('/otphtml');
                }
              })
        }
    })
  }
});
    
//verify OTP api
 router.post('/otpVerify',(req,res) =>{
     
    var userotp=req.body.otp;
studentInfo
    .find({ Email: globalEmail, Otp:userotp })
    .then(data => {
      companyDet = data;
      if (companyDet.length == 0) {
      //res.status(400).send({ status: false, message: "Otp mismatch" });
        res.redirect('/otphtml');
      }
    else{
            //update verified in otpVerify
            studentInfo.updateOne({ Email: globalEmail }, { OtpVerify: "Verified" }, function (err, otpVerified) 
             {
            if (err)
             res.status(400).send({ status: false, message: "Unable to update User data" });
            else 
            res.redirect('/'); 
            //res.status(200).send({status: true, message: "Otp Verified successfully"});
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
                    { 
                        utils.generateHash(userpass, function (err, hash) {
                            if (!err && hash) {
                              hashedpass = hash
                           
                 // Update password with hash value
                 studentInfo.updateOne({ Email: globalEmail }, { Password: hashedpass }, function (err, passwordUpdate) 
                 {
                    if (err) res.status(400).send({ status: false, message: "Unable to update User data" });
                    else passwordUpdate.length != 0;
                    {
                      var result = {
                        status: true,
                        message: "Your Password Updated successfully."
                      };
                      res.status(200).send(result);
                    }
                  })
                }
                else res.status(400).send({ status:false , message:"Password doesn't met requirement"});
        });
    }
});
  
// login api starts
router.post('/login', (req,res) =>{
    var email=req.body.email,
    password=req.body.password;
   if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ||
      req.body.password == null || typeof req.body.password == undefined || req.body.password.length == 0) {
      res.redirect('/');
      }

globalEmail=email;

//password check with Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character
function passwordCheck (password1) {
return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/).test(password1)
};

function emailCheck (password1) {
return (/^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@stu.upes.ac.in$/).test(password1)
};
var hashedpass=""
// checking email and password criteria
if(!!emailCheck(email))
{  
if(!!passwordCheck(password))
{
    studentInfo
    .find({ Email: email })
    .then(data => {
      companyDet = data;
      if (companyDet.length == 0) {
      res.status(400).send({ status: false, message: "No User found" });
      }
    else {
       var dbpass= companyDet[0].Password;
       var otpver=companyDet[0].OtpVerify;
       utils.validatePassword(password, dbpass, function (err, data) {
        if (!err && data) {
        if(otpver=="Verified")
        {
          res.redirect('/profile');
         // res.status(200).send({status: true , message:"we will soon add homepage"})
        }
        else
        {
         // res.status(400).send({status: false , message:"Otp not verified."})
         res.redirect('/otprevalid');
        }
      }
    else
      res.status(400).send({status: false , message:"EMail/Password incorrect"});
    })
   }
  })
 }
else
 {
  res.redirect('/');
 }
}
else
 {
  res.redirect('/');
 }
});
//login api ends

router.post('/SelectFood',(req,res) =>{
     var food=[];
   food=req.body.food;
   var fs=[];
  for(var i=0;i<food.length;i++)
   fs[i]=food[i].split(' ');
var sum=0;
orderInfo
  .find({ Email: globalEmail })
  .then(data => {
    companyDet = data;
    if (companyDet.length == 0) {

       //sending data in database
       for(var i=0;i<fs.length;i++)
       sum=sum+ parseInt(fs[i][1],10);

  //console.log(sum);


    orderInfo.create({Email : globalEmail , Items:fs, price: sum });
    sum=0;
    food=null;
    res.redirect('/thanks'); 
    
    }
    else{ if(companyDet[0].taken==false && companyDet[0].accepted==true)
      {
        res.status(200).send({ status: true, message: "First take your previous order" });

      }
      else{
         //sending data in database
         for(var i=0;i<fs.length;i++)
         sum=sum+ parseInt(fs[i][1],10);
          //update verified in otpVerify
          orderInfo.updateOne({ Email: globalEmail }, { Items: fs , price: sum }, function (err, foodsent) 
           {
          if (err)
           res.status(400).send({ status: false, message: "Unable to update User data" });
          else 
          res.redirect('/thanks'); 
          sum=0;
          food=null;
              });
            }
      }    
  
})
})

router.get('/register', (req, res) =>{
    res.render('register');
    });

router.get('/forgot', (req, res) =>{
    res.render('forgot');
    });

router.get('/otphtml', (req, res) =>{
    res.render('otp');
    });

router.get('/otprevalid', (req, res) =>{
    res.render('otpnotv');
    });

router.get('/profile', (req, res) =>{
    res.render('profile1');
    });

router.get('/barons', (req, res) =>{
    res.render('baronsmenu');
    });

router.get('/foodcourt', (req, res) =>{
    res.render('foodcourtmenu');
   });

router.get('/thanks', (req, res) =>{
    res.render('thanks');
    });

router.get('/orders', (req, res) =>{
    res.render('yourorders');
    });

router.get('/yourprofile', (req, res) =>{
    res.render('yourprofile');
    });

module.exports = function (app) {
    app.use("/", router);
    };