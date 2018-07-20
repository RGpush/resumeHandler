const express = require('express');
const route = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

// Load user model
const User = require('../../models/User');

//@route GET users/api/test
//@desc Tests user route
//@access public
route.get('/test',(req,res)=>{res.json({msg:"users playground"})});

//@route POST users/api/register
//@desc register user 
//@access public
route.post('/register',(req,res)=>{
    User.findOne({email:req.body.email}).then(user=>{
        if(user){
            return res.status(400).json({email:'Email already registerd'});
        }else{
            const avatar = gravatar.url(req.body.email,{
                s: '200', //size
                r: 'pg',  // rating
                d: 'mm'  //default
            });
            const newuser = new User({
                name: req.body.name,
                email:req.body.email,
                password:req.body.password,
                avatar
            });
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(newuser.password,salt,(err,hash)=>{
                    if(err) throw err;
                    newuser.password = hash;
                    newuser.save()
                    .then(user=>res.json(user))
                    .catch(err=> console.log(err));
                })
            })
        }
    })
});

//@route POST users/api/login
//@desc login user / returning JWT token 
//@access public
route.post('/login',(req,res)=>{

    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({email})
    .then(user=>{
        //check for user
        if(!user){
            return res.status(404).json({email:"User dosen't exist"});
        }

        bcrypt.compare(password,user.password)
        .then(isMatch=>{
            if(isMatch){
                res.json({msg:'Success'});
            }
            else{
                return res.status(400).json({password:'Password Incorrect'});
            }
        });
    });
})

module.exports = route;