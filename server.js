const express = require('express');
const app = express();
const mongoose = require('mongoose');
const shorturl = require('./models/shorturl');

// mongoose.connect('mongodb://localhost/urlShortner', {
//     useNewUrlParser: true, useUnifiedTopology: true
// });
mongoose.connect('mongodb+srv://root:Lj7x2158V1aA2UQG@cluster0.uyjet.mongodb.net/urlShortner?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
    
});


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

app.get('/', async (req, res) =>{
const shorturls = await shorturl.find().sort({clicks: -1});
res.render('index', {shorturls: shorturls});
});

app.post('/shorturl', async (req,res)=>{
await shorturl.create({full: req.body.fullurl});
res.redirect('/');
})

app.get('/:shortUrl', async (req, res) =>{
const ShortUrl= await shorturl.findOne({short: req.params.shortUrl});
if(ShortUrl == null)
return res.sendStatus(404);
//console.log(shortUrl);
ShortUrl.clicks++
ShortUrl.save();
res.redirect(ShortUrl.full);

});

app.listen(process.env.PORT || 5000);
