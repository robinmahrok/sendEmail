const express = require("express");
const studentInfo = require('../models/studentInfo');
var {mailer} = require('../functions/mailer');
var {mailer2,mailer3,mailer4} = require('../functions/mailer');

var utils=require('../functions/utils');
const { models } = require('mongoose');
router = express.Router();
var globalEmail=""; 
const orderInfo = require('../models/orderInfo');
const { OrderInfo } = require("../models");
var JSAlert = require("js-alert");

var error="";
router.get('/', async (req, res) =>{
  req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    }
    else 
    res.render('index',{error});
});

});

//signup api
router.post('/signup',   (req,res)=>{
  req.session.email1 = req.body.email;
        var name=req.body.name, email = req.body.email,
        password=req.body.password;
        if (req.body.name == null || typeof req.body.name == undefined || req.body.name == "") {
          res.render('register-err-success',{success:1,message:"Email or Password is missing"});
          } else if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ||
            req.body.password == null || typeof req.body.password == undefined || req.body.password.length == 0) {
              res.render('register-err-success',{success:1,message:"Email or Password is missing"});
            }

    globalEmail=req.session.email1;

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
res.render('register-err-success',{success:0,message:"Password should contains atleast 6 characters consists of uppercase,lowercase,number and character"});
}
}
else {//res.status(400).send({status:false , message:"Email does not met criteria"});
res.render('register-err-success',{success:0,message:"You have entered an invalid email address! Only college mail Id is allowed"});
}

} else {
  res.render('register-err-success',{success:0,message:"User already exists"});
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
  if(req.session.email1)
  {
    var email = req.body.email
globalEmail=req.session.email1;

   if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ) 
   {
        res.status(400).send({ status: false, message: "Email is missing, Please enter." });
    }
else{
    studentInfo.getUserByEmail(email, (err, user) => {
        if (err || !user) {
          res.write('<h1>User not found. Login again from link provided below.</h1>');
  res.end('<a href='+'/'+'>Login</a>');
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
}
else{
  res.write('<h1>Your session is expired. Please login again to continue.</h1>');
  res.end('<a href='+'/'+'>Login</a>');
}
});
    
//verify OTP api
 router.post('/otpVerify',(req,res) =>{
  if(req.session.email1)
  {
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
  }
  else{
    res.write('<h1>Your session is expired. Please login again to continue.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
})
 


// change password api
router.post('/forgotPassword',(req,res) =>{
  if(req.session.email1)
  {
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
                    else if(passwordUpdate.length != 0) 
                    {
                      res.write('<h1>Your Password is updated Successfully. Please login again to continue.</h1>');
                      res.end('<a href='+'/'+'>Login</a>');
                    }
                  })
                }
                else res.status(400).send({ status:false , message:"Password doesn't met requirement"});
        });
    }
  }
    else{
      res.write('<h1>Your session is expired. Please login again to continue.</h1>');
      res.end('<a href='+'/'+'>Login</a>');
    }
});
  
// login api starts
router.post('/login', (req,res) =>{

  error="";
  req.session.email1 = req.body.email;
    var email=req.body.email,
    password=req.body.password;
   if (req.body.email == null || typeof req.body.email == undefined || req.body.email.length == 0 ||
      req.body.password == null || typeof req.body.password == undefined || req.body.password.length == 0) {
        error="Enter email/password";
        res.render('index-err-success',{success:0,message:"Fields can not be empty!"});
      }

  globalEmail=email;
  var hashedpass=""

    studentInfo
    .find({ Email: email })
    .then(data => {
      companyDet = data; 
      if (companyDet.length == 0) {
        res.render('index-err-success',{success:0,message:"User Not Found!!"});
      }
    else {
       var dbpass= companyDet[0].Password;
       var otpver=companyDet[0].OtpVerify;
       utils.validatePassword(password, dbpass, function (err, data) {
        if (!err && data) 
        {
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
    { 
      res.render('index-err-success',{success:0,message:"Wrong Credentials!"}); 
    }
    })
   }
  })
});
//login api ends

router.get('/logout',(req,res)=>{
  req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    }
    res.redirect('/');
});
})

router.get('/redirectShop',(req,res)=>{
 
    res.render('indexShopkeeper');

})

router.post('/selectRestraw',(req,res) =>{
  if(req.session.email1)
  { 
    req.session.rest=req.body.rest;
           if(req.session.rest=="Food Court"){ 
             res.redirect('/foodcourt');
          }
          else{
            res.redirect('/barons');
          }
        
  }
  else{
    res.write('<h1>Your session is expired. Please login again to continue.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
})

//select food api
router.post('/SelectFood',(req,res) =>{
  if( req.session.email1)
  {  
   var food=[];
   food=req.body.food;
   globalEmail=req.session.email1;
   var fs=[];

  if(Array.isArray(food))
  { 
    for(var i=0;i<food.length;i++)
    fs[i]=food[i].split(' ');
   }
   else  
   fs[0]=food.split(' ');

var sum=0;
orderInfo
  .find({ Email: globalEmail })
  .then(data => {
    companyDet = data;
    if (companyDet.length == 0) {
      //Calculating total amount
       for(var i=0;i<fs.length;i++)
       sum=sum+ parseInt(fs[i][1],10);

    orderInfo.create({Email : globalEmail , Items:fs, price: sum , restrau:req.session.rest });
    sum=0;
    food=null;
    res.redirect('/confirm'); 
    }
    else{
       if(companyDet[companyDet.length-1].taken==0 && companyDet[companyDet.length-1].accepted==1)
      {
        res.render('rejectOrder',{Email:globalEmail})
      }
      else{
         //sending data in database
         for(var i=0;i<fs.length;i++)
         sum=sum+ parseInt(fs[i][1],10);
          //update verified in otpVerify
          orderInfo.create({Email : globalEmail , Items:fs, price: sum , restrau:req.session.rest }, function (err, foodsent) 
           {
          if (err)
           res.status(400).send({ status: false, message: "Unable to update User data" });
          else 
         {  
          sum=0;
          food=null;
          res.redirect('/confirm');
         }
        });
       }
    }    
})
  }
  else{
    res.write('<h1>Your session is expired. Please login again to continue.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
})

var ordernumber="";

//generate order number api
router.post('/orderno',(req,res) =>{
  if( req.session.email1)
  {  
    globalEmail=req.session.email1;
  function f(){
  var text = "";
  var char_list =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   
  for (var i = 0; i < 10; i++) {
    text += char_list.charAt(Math.floor(Math.random() * char_list.length));
  }
  ordernumber=text;
  console.log(text);
  orderInfo
  .find({ orderNo: text })
  .then(data => {
    companyDet = data;
          //update ordernumber in database
          orderInfo.updateOne({ Email: globalEmail }, { orderNo:text }, function (err, otpVerified) 
           {
          if (err)
           res.status(400).send({ status: false, message: "Unable to update User data" });
          else 
          res.render('thanks',{Email:globalEmail,orderNo:text});
              });

          })
        }
        f();
      }
      else
      {
        res.write('<h1>Your session is expired. Please login again to continue.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
      }
})


const sendOrderNo = ( recipient, otpVal,Items,price,restraw) => {
  mailer2({
      email: recipient,
     otpVal,
     Items,
     price,
     restraw
    }, result => {
      if (result && result.status == 1000) {
        console.log("Otp Sent!");
       
      }
    });   
}

//send Order No on Email
router.post('/sendmail',(req,res) =>{
  
  if( req.session.email1)
  {  
  var email = globalEmail;
  orderInfo
  .find({ Email: globalEmail })
  .then(data => {
    companyDet = data;
    var it=companyDet[0].Items;
    var ch="";
    for(var i=0;i<it.length;i++)
    {
      var a=it[i];
      for(var j=0;j<a.length;j++)
      {
        ch=ch+a[j]+" ";
      }
      if(i<it.length-1)
      ch=ch+",";
    }
  console.log(ch);
 let err=   sendOrderNo( email, companyDet[0].orderNo,ch,companyDet[0].price,companyDet[0].restrau)
 if (err)
       { 
      
          res.status(400).send({
          status: false,
          message: err });
      }
      else { 
      res.redirect('/profile');
    }
          })
        }
      else{
        
        res.write('<h1>Your session is expired. Please login again to continue.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
      }

});
  
router.get('/yourProfileDash', (req, res) =>{
  if(req.session.email1)
  {
  orderInfo.find({email:req.session.email1}).then(data=>{
    if(data.length==0)
    {
      res.render('yourOrders-err');
    }
    else
    {
      var Email=req.session.email1;
      var orderid = [];
      var amount = [];
      var status = [];
      var deliveryStatus = [];
      var restraw = [];
      var shop = [];
      var food = [];
      var ord = "";
      for (var i = 0; i < data.length; i++) {
        orderid[i] = data[i].orderNo;
        amount[i] = data[i].price;
        status[i]=data[i].accepted;
        restraw[i]=data[i].restrau;
        shop[i]=data[i].shop;
        deliveryStatus[i]=data[i].taken;
        for (var j = 0; j < companyDet[i].Items.length; j++) {
          if (ord == "") {
            ord = data[i].Items[j][0] + "-" + data[i].Items[j][1];
          } else {
            ord =
              ord +
              "\r\n" +
              data[i].Items[j][0] +
              "-" +
              data[i].Items[j][1];
          }
        }
        food[i] = ord;
        ord = "";
      }
      res.render('yourorders',{orderid,amount,Email,status,restraw,shop,deliveryStatus,food});

    }
  })
 
  }
  else{
    res.write('<h1>Your session is expired. Please login again to continue.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  } 
});

router.get('/register', (req, res) =>{
    res.render('register');
    });

router.get('/forgot', (req, res) =>{
  if( req.session.email1)
  {   
  res.render('forgot');
  }
  else res.redirect('/');

});

router.get('/otphtml', (req, res) =>{
  if( req.session.email1)
  {  
  res.render('otp');
}
else res.redirect('/');
    });

router.get('/otprevalid', (req, res) =>{
  if( req.session.email1)
  {  
  res.render('otpnotv');
}
else res.redirect('/');
});

router.get('/profile', (req, res) =>{
  if( req.session.email1)
  { 
    res.render('profile1',{Email:globalEmail});
  }
    else res.redirect('/');

    });

router.get('/confirm', (req, res) =>{
  if( req.session.email1)
  {   
  res.render('confirmation',{Email:globalEmail});
  }
  else res.redirect('/');
      });
  

router.get('/barons', (req, res) =>{
  if( req.session.email1)
  { 
    res.render('baronsmenu',{Email:globalEmail});
  }
  else res.redirect('/');
    });

router.get('/foodcourt', (req, res) =>{
  if( req.session.email1)
  { 
    res.render('foodcourtmenu',{Email:globalEmail});
  }
  else res.redirect('/');
   });


router.get('/orders', (req, res) =>{
  if( req.session.email1)
  { 
    res.render('yourorders',{Email:globalEmail});
  }
  else res.redirect('/');
    });

router.get('/yourprofile', (req, res) =>{
  if( req.session.email1)
  { 
    res.render('yourprofile',{Email:globalEmail});
  }
  else res.redirect('/');
    });

    


module.exports = function (app) {
    app.use("/", router);
    };