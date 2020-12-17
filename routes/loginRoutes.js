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
res.render('index',{error});
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
res.redirect('/register');
}
}
else {//res.status(400).send({status:false , message:"Email does not met criteria"});
res.redirect('/register');
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
      res.render('index',{error});
      error="";
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
 error="Email/Password Incorrect";
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
 }
else
 { error="";
  res.render('index',{error});
   
 }
}
else
 {   error="";
  res.render('index',{error});
 
 }
});
//login api ends

router.post('/selectRestraw',(req,res) =>{
  if(req.session.email1)
  {
    var rest=req.body.rest;
    console.log(rest);
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
    else{ if(companyDet[0].taken==0 && companyDet[0].accepted==1)
      {
       
        res.render('rejectOrder',{Email:globalEmail})
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
  }
  else{
    res.write('<h1>Your session is expired. Please login again to continue.</h1>');
    res.end('<a href='+'/'+'>Login</a>');
  }
})

var ordernumber="";

//verify OTP api
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
      else{
        
        res.write('<h1>Your session is expired. Please login again to continue.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
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
   var take=[];
   var food=[];
   var ord="";
   for(var i=0;i<companyDet.length;i++)
  {  email[i]=companyDet[i].Email;
     orderid[i]=companyDet[i].orderNo;
    amount[i]=companyDet[i].price;
    if(companyDet[i].accepted==0)
    status[i]="Pending";
    else if(companyDet[i].accepted==1)
    status[i]="Approved";
    else if(companyDet[i].accepted==-1)
    status[i]="Declined";
    if(companyDet[i].taken==0)
    take[i]="Pending";
    else if(companyDet[i].taken==1)
    take[i]="Taken";
    else if(companyDet[i].taken==-1)
    take[i]="Declined";
    for(var j=0;j<companyDet[i].Items.length;j++)
    { if(ord=="")
    {
      ord=companyDet[i].Items[j][0]+"-"+companyDet[i].Items[j][1];
    }
    else
    {
      ord=ord+"\r\n"+companyDet[i].Items[j][0]+"-"+companyDet[i].Items[j][1];
    }
    }
   food[i]=ord;


ord="";
  }
    res.render('admin',{email,orderid,amount,status,take,food});
  

}).catch(err => console.log(err));
});

const sendStatus = ( email,orderNo,status1) => {
  mailer3({
    email,
      orderNo,
      status1
    }, result => {
      if (result && result.status == 1000) {
        console.log("Status sent");
       
      }
    });   
}
 
router.get('/AcceptOrder/:orderNo', (req,res)=>{
  var orderNo=req.params.orderNo;
  orderInfo.findOne({orderNo: req.params.orderNo})
  .exec((err,order)=>{
    if(err){
      res.status(404).send({message:err})
      return;
    }
    if(!order){
      res.status(404).send({message: 'Order not Found'})
      return;
    }
    if(order){
      order.accepted = 1;
      order.save();
      var status1="Accepted";
      let err=   sendStatus(order.Email,orderNo,status1)
      if (err)
            { 
           
             res.status(400).send({
               status: false,
               message: err });
           }
           else { 
            res.status(200).send({message:'Success'});
         }
   
    }
  })
})

router.get('/DeclineOrder/:orderNo', (req,res)=>{
  var orderNo=req.params.orderNo;
  orderInfo.findOne({orderNo: req.params.orderNo})
  .exec((err,order)=>{
    if(err){
      res.status(404).send({message:err})
      return;
    }
    if(!order){
      res.status(404).send({message: 'Order not Found'})
      return;
    }
    if(order){
      order.accepted = -1;
      order.save();

      var status1="Declined";
      let err=   sendStatus(order.Email,orderNo,status1)
      if (err)
            { 
           
             res.status(400).send({
               status: false,
               message: err });
           }
           else { 
            res.status(200).send({message:'Success'});
         }
   
    }
  })
})

router.get('/OrderTaken/:orderNo', (req,res)=>{
  // console.log(req.params.orderNo);
  orderInfo.findOne({orderNo: req.params.orderNo})
  .exec((err,order)=>{
    if(err){
      res.status(404).send({message:err})
      return;
    }
    if(!order){
      res.status(404).send({message: 'Order not Found'})
      return;
    }
    if(order){
      order.taken = 1;
      order.save();
      res.status(200).send({message:'Success'});
    }
  })
})

router.get('/OrderNotTaken/:orderNo', (req,res)=>{
  // console.log(req.params.orderNo);
  orderInfo.findOne({orderNo: req.params.orderNo})
  .exec((err,order)=>{
    if(err){
      res.status(404).send({message:err})
      return;
    }
    if(!order){
      res.status(404).send({message: 'Order not Found'})
      return;
    }
    if(order){
      order.taken = -1;
      order.save();
      res.status(200).send({message:'Success'});
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