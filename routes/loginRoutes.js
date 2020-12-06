const express = require("express");
const studentInfo = require('../models/studentInfo');
var mailer = require('../functions/mailer');
var mailer2 = require('../functions/mailer');

var utils=require('../functions/utils');
const { models } = require('mongoose');
router = express.Router();
var globalEmail=""; 
const orderInfo = require('../models/orderInfo');
const { OrderInfo } = require("../models");

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


//select food api
router.post('/SelectFood',(req,res) =>{
     var food=[];
   food=req.body.food;
   var fs=[];

  if(Array.isArray(food))
  { for(var i=0;i<food.length;i++)
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



    orderInfo.create({Email : globalEmail , Items:fs, price: sum });
    sum=0;
    food=null;

    res.redirect('/confirm'); 
    
    }
    else{ if(companyDet[0].taken==false && companyDet[0].accepted==1)
      {
        res.status(200).send({ status: true, message: "First take your previous order" });

      }
      else{
         //sending data in database
         for(var i=0;i<fs.length;i++)
         sum=sum+ parseInt(fs[i][1],10);
          //update verified in otpVerify
          console.log(fs);
          orderInfo.updateOne({ Email: globalEmail }, { Items: fs , price: sum }, function (err, foodsent) 
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
})

var ordernumber="";

//verify OTP api
router.post('/orderno',(req,res) =>{
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
})


const sendOrderNo = ( recipient, otpVal,Items,price) => {
  mailer2({
      email: recipient,
     otpVal,
     Items,
     price
    }, result => {
      if (result && result.status == 1000) {
        console.log("Otp Sent!");
       
      }
    });   
}

//send Order No on Email
router.post('/sendmail',(req,res) =>{
  var email = globalEmail;
console.log(globalEmail);
 if (email == null || typeof email == undefined || email.length == 0 ) 
 {
      res.status(400).send({ status: false, message: "Email is missing, Please enter." });
  }
else{
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
 let err=   sendOrderNo( email, companyDet[0].orderNo,ch,companyDet[0].price)
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
});
  

//send Order No on Email
router.post('/allOrders',(req,res) =>{
 
  orderInfo
  .find({})
  .then(data => {
    companyDet = data;

   var email=[];
   var orderid=[];
   var amount=[];
   var status=[];

   for(var i=0;i<companyDet.length;i++)
  {  email[i]=companyDet[i].Email;
     orderid[i]=companyDet[i].orderNo;
    amount[i]=companyDet[i].price;
    if(companyDet[i].accepted==false)
    status[i]="Pending";
    else if(companyDet[i].accepted==true)
    status[i]="Approved";
    else
    status[i]="Declined";
  }
    res.render('admin',{email,orderid,amount,status});
  

}).catch(err => console.log(err));
});
  
//send Order No on Email
router.post('/currentApp',(req,res) =>{
 
  orderInfo
  .find({accepted:true})
  .then(data => {
    companyDet = data;

   var email=[];
   var orderid=[];
   var amount=[];
   var status=[];

   for(var i=0;i<companyDet.length;i++)
  {  email[i]=companyDet[i].Email;
     orderid[i]=companyDet[i].orderNo;
    amount[i]=companyDet[i].price;
    if(companyDet[i].accepted==false)
    status[i]="Pending";
    else if(companyDet[i].accepted==true)
    status[i]="Approved";
    else
    status[i]="Declined";
  }
    res.render('admin',{email,orderid,amount,status});
  

}).catch(err => console.log(err));
});
  

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
    res.render('profile1',{Email:globalEmail});
    });

router.get('/confirm', (req, res) =>{
    res.render('confirmation',{Email:globalEmail});
      });
  

router.get('/barons', (req, res) =>{
    res.render('baronsmenu',{Email:globalEmail});
    });

router.get('/foodcourt', (req, res) =>{
    res.render('foodcourtmenu',{Email:globalEmail});
   });


router.get('/orders', (req, res) =>{
    res.render('yourorders',{Email:globalEmail});
    });

router.get('/yourprofile', (req, res) =>{
    res.render('yourprofile',{Email:globalEmail});
    });

    
router.get('/admin', (req, res) =>{
  res.render('admin');
  });

module.exports = function (app) {
    app.use("/", router);
    };