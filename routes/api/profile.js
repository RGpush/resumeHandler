const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Profile model
const Profile = require('../../models/Profile');

//Load User model
const User = require('../../models/User');



//@route GET profile/api/test
//@desc Tests profile route
//@access public
route.get('/test',(req,res)=>{res.json({msg:"Profile playground"})});


//@route GET api/profile
//@desc GET current user profile
//@access private
route.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const errors = {};

    Profile.findOne({user:req.user.id})
    .then(profile=>{
        if(!profile){
            errors.nonprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    }).catch(err=>res.status(404).json(err));
});


module.exports = route;