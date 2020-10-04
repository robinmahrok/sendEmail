const shorturl = require('../models/shorturl');
const express = require("express");
  router = express.Router();
  router.get('/', async (req, res) =>{
    const shorturls = await shorturl.find().sort({clicks: -1});
    res.render('index', {shorturls: shorturls});
    });


    router.post('/shorturl',  async (req,res)=>{
    //  console.log("It's Working");
    console.log(req.body);
    await shorturl.create({full: req.body.fullUrl});
    res.redirect('/');
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