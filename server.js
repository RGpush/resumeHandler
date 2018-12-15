const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const post = require('./routes/api/post');

//body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//db config
const db = require('./config/keys').mongoURI;

//connect to mongoDB
mongoose
.connect(db)
.then(()=> console.log('MongoDB connected'))
.catch(err=> console.log(err));

//app.get('/',(req,res) => res.send('Hello from node server'));

//passport middleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);

app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',post);

const port = process.env.PORT || 5000;

app.listen(port,()=>console.log(`server is up and running on port : ${port}`));