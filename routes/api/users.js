const express = require('express');
const route = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const passport = require('passport');

//Load input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load user model
const User = require('../../models/User');

const secretKey = require('../../config/keys').secretOrKey;

//@route GET users/api/test
//@desc Tests user route
//@access public
route.get('/test',(req,res)=>{res.json({msg:"users playground"})});

//@route POST users/api/register
//@desc register user 
//@access public
route.post('/register',(req,res)=>{

    const {errors, isValid} = validateRegisterInput(req.body);

    //Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({email:req.body.email}).then(user=>{
        if(user){
            errors.email = 'Email already exist';
            return res.status(400).json(errors);
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

    const {errors, isValid} = validateLoginInput(req.body);

    //Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({email})
    .then(user=>{
        //check for user
        if(!user){
            errors.email = "User dosen't exist";
            return res.status(404).json(errors);
        }

        //check password
        bcrypt.compare(password,user.password)
        .then(isMatch=>{
            if(isMatch){
                //user matched
                //res.json({msg:'Success'});
                const payload = {id:user.id,name:user.name,avatar:user.avatar}//create jwt payload
                //sign token
                jwt.sign(payload,secretKey,{expiresIn:3600},(err,token)=>{
                        res.json({
                            success:true,
                            token: 'Bearer ' + token
                        })
                });
            }
            else{
                errors.password = 'Password Incorrect';
                return res.status(400).json(errors);
            }
        });
    });
});


//@route POST users/api/current
//@desc Returning current user
//@access private
route.get('/current',passport.authenticate('jwt',{session:false}),
        (req,res)=>{
            res.json(req.user);

});


module.exports = route;