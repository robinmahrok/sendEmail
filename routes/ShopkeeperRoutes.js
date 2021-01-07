const express = require("express");
const studentInfo = require("../models/studentInfo");
var mailer = require("../functions/mailer");
var utils = require("../functions/utils");
const { models } = require("mongoose");
router = express.Router();
var { globalEmail } = require("./loginRoutes");
const orderInfo = require("../models/orderInfo");
const ShopOwner = require("../models/ShopOwner");

//signup api
router.post("/signupShop", (req, res) => {
  var ShopName = "Annapurna",
    email = "robinsinghmahrok@gmail.com",
    Owner = "Food Court",
    password = "Yaass@123";

  var hashedpass = "";

  utils.generateHash(password, function (err, hash) {
    if (!err && hash) {
      hashedpass = hash;

      function genOTP(min, max) {
        return Math.floor(min + Math.random() * max);
      }

      var otpVal = genOTP(100000, 900000);

      //sending data in database
      ShopOwner.create({
        ShopName: ShopName,
        Email: email,
        Password: hashedpass,
        OtpVerify: "Pending",
        Otp: otpVal,
        Owner: Owner,
      });
      if (ShopOwner.create()) res.status(200).send("Done");
    }
  });
}); //signup api end

// login api starts
router.post("/loginShopkeeper", (req, res) => {
  req.session.email1 = req.body.email;
  var email = req.body.email,
    password = req.body.password;
  if (
    req.body.email == null ||
    typeof req.body.email == undefined ||
    req.body.email.length == 0 ||
    req.body.password == null ||
    typeof req.body.password == undefined ||
    req.body.password.length == 0
  ) {
    res.render("indexShop-err-succ", {
      success: 0,
      message: "Fields can not be empty!",
    });
  }

  globalEmail = email;
  var hashedpass = "";

  ShopOwner.find({ Email: email }).then((data) => {
    companyDet = data;
    if (companyDet.length == 0) {
      res.render("indexShop-err-succ", {
        success: 0,
        message: "User Not Found!!",
      });
    } else {
      var dbpass = companyDet[0].Password;
      var otpver = companyDet[0].OtpVerify;
      req.session.shopName = companyDet[0].ShopName;
      utils.validatePassword(password, dbpass, function (err, data) {
        if (!err && data) {
          if (otpver == "Verified") {
            res.redirect("/allOrders");
          } else {
            res.render("indexShop-err-succ", {
              success: 0,
              message: "Otp Not Verified",
            });
          }
        } else {
          res.render("indexShop-err-succ", {
            success: 0,
            message: "Wrong Credentials!",
          });
        }
      });
    }
  });
});
//login api ends

//show all orders on frontend
router.get("/allOrders", (req, res) => {
  if (req.session.email1) {
    var EmailShop = req.session.email1;
    var shopName = req.session.shopName;
    orderInfo
      .find({})
      .then((data) => {
        companyDet = data;

        var email = [];
        var orderid = [];
        var amount = [];
        var status = [];
        var take = [];
        var food = [];
        var ord = "";
        for (var i = 0; i < companyDet.length; i++) {
          email[i] = companyDet[i].Email;
          orderid[i] = companyDet[i].orderNo;
          amount[i] = companyDet[i].price;
          if (companyDet[i].accepted == 0) status[i] = "Pending";
          else if (companyDet[i].accepted == 1) status[i] = "Approved";
          else if (companyDet[i].accepted == -1) status[i] = "Declined";
          if (companyDet[i].taken == 0) take[i] = "Pending";
          else if (companyDet[i].taken == 1) take[i] = "Taken";
          else if (companyDet[i].taken == -1) take[i] = "Declined";
          for (var j = 0; j < companyDet[i].Items.length; j++) {
            if (ord == "") {
              ord = companyDet[i].Items[j][0] + "-" + companyDet[i].Items[j][1];
            } else {
              ord =
                ord +
                "\r\n" +
                companyDet[i].Items[j][0] +
                "-" +
                companyDet[i].Items[j][1];
            }
          }
          food[i] = ord;
          ord = "";
        }
        res.render("admin", {
          email,
          orderid,
          amount,
          status,
          take,
          food,
          EmailShop,
        });
      })
      .catch((err) => console.log(err));
  } else {
    res.write(
      "<h1>Your session is expired. Please login again to continue.</h1>"
    );
    res.end("<a href=" + "/indexShop" + ">Login</a>");
  }
});

const sendStatus = (email, orderNo, status1) => {
  mailer3(
    {
      email,
      orderNo,
      status1,
    },
    (result) => {
      if (result && result.status == 1000) {
        console.log("Status sent");
      }
    }
  );
};

router.get("/AcceptOrder/:orderNo", (req, res) => {
  var orderNo = req.params.orderNo;
  orderInfo.findOne({ orderNo: req.params.orderNo }).exec((err, order) => {
    if (err) {
      res.status(404).send({ message: err });
      return;
    }
    if (!order) {
      res.status(404).send({ message: "Order not Found" });
      return;
    }
    if (order) {
      order.accepted = 1;
      order.save();
      var status1 = "Accepted";
      let err = sendStatus(order.Email, orderNo, status1);
      if (err) {
        res.status(400).send({
          status: false,
          message: err,
        });
      } else {
        res.status(200).send({ message: "Success" });
      }
    }
  });
});

router.get("/DeclineOrder/:orderNo", (req, res) => {
  var orderNo = req.params.orderNo;
  orderInfo.findOne({ orderNo: req.params.orderNo }).exec((err, order) => {
    if (err) {
      res.status(404).send({ message: err });
      return;
    }
    if (!order) {
      res.status(404).send({ message: "Order not Found" });
      return;
    }
    if (order) {
      order.accepted = -1;
      order.save();

      var status1 = "Declined";
      let err = sendStatus(order.Email, orderNo, status1);
      if (err) {
        res.status(400).send({
          status: false,
          message: err,
        });
      } else {
        res.status(200).send({ message: "Success" });
      }
    }
  });
});

router.get("/OrderTaken/:orderNo", (req, res) => {
  // console.log(req.params.orderNo);
  orderInfo.findOne({ orderNo: req.params.orderNo }).exec((err, order) => {
    if (err) {
      res.status(404).send({ message: err });
      return;
    }
    if (!order) {
      res.status(404).send({ message: "Order not Found" });
      return;
    }
    if (order) {
      order.taken = 1;
      order.save();
      res.status(200).send({ message: "Success" });
    }
  });
});

router.get("/OrderNotTaken/:orderNo", (req, res) => {
  // console.log(req.params.orderNo);
  orderInfo.findOne({ orderNo: req.params.orderNo }).exec((err, order) => {
    if (err) {
      res.status(404).send({ message: err });
      return;
    }
    if (!order) {
      res.status(404).send({ message: "Order not Found" });
      return;
    }
    if (order) {
      order.taken = -1;
      order.save();
      res.status(200).send({ message: "Success" });
    }
  });
});

router.get("/logoutShopkeeper", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.render("indexShopkeeper");
  });
});

router.get("/indexShop", (req, res) => {
  res.render("indexShopkeeper");
});

module.exports = function (app) {
  app.use("/", router);
};
