const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const vaidateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/academicDetails');

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

    Profile.findOne({user: req.user.id})
      .populate('user', ['name', 'avatar'])
      .then(profile=>{
          if(!profile){
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
          }
        res.json(profile);
      }).catch(err=>res.status(404).json(err));
});

//@route GET api/profile/all
//@desc  Get all profiles
//@access public
route.get('/all',(req, res) => {

    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then( profiles => {
            if(!profiles) {
                errors.noprofile = 'There are no profiles.';
                res.status(404).json(errors);
            }
            res.json(profiles);
        }).catch(err => res.status(404).json({profile: 'There are no profiles.'}));
});



//@route GET api/profile/handle/:handle
//@desc  Get profile by handle
//@access public
route.get('/handle/:handle',(req, res) => {

    const errors = {};

   Profile.findOne({ handle: req.params.handle })
       .populate('user', ['name', 'avatar'])
       .then( profile => {
           if(!profile) {
               errors.noprofile = 'There is no profile for this user';
               res.status(404).json(errors);
           }
           res.json(profile);
       }).catch(err => res.status(404).json({profile: 'There is no profile for this user.'}));
});



//@route GET api/profile/user/:user_id
//@desc  Get profile by user ID
//@access public
route.get('/user/:user_id',(req, res) => {

    const errors = {};

    Profile.findOne({ user: req.params.user_id })
        .populate('users', ['name', 'avatar'])
        .then( profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        }).catch(err => res.status(404).json({profile: 'There is no profile for this user.'}));
});


//@route POST api/profile
//@desc  Create user profile
//@access private
route.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{

    const { errors, isValid} = vaidateProfileInput(req.body);

    //Check Validation
    if( !isValid ) {
        //Return  any errors with status 400
        return res.status(400).json(errors);
    }

    //Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    //Skills split into array
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    // social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    //profile
    Profile.findOne({ user: req.user.id }).then( profile =>{

        if(profile){
            //Update
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true}
            ).then(profile => res.json(profile));

        }else {

            //Create

            // check if handle exist, (handle we use for SEO)
            Profile.findOne({ handle: profileFields.handle }).then( profile=> {

                if(profile){
                    errors.handle = 'That handle already exist.';
                    res.status(400).json(errors);
                }
            });

            //save profile
            new Profile(profileFields).save().then(profile => res.json(profile));

        }

    });



});


//@route POST api/profile/experience
//@desc  add experience to profile
//@access private
route.post('/experience',passport.authenticate('jwt',{session:false}),(req,res)=>{

    const { errors, isValid} = validateExperienceInput(req.body);

    //Check Validation
    if( !isValid ) {
        //Return  any errors with status 400
        return res.status(400).json(errors);
    }


    Profile.findOne({ user: req.user.id})
        .then(
            profile => {

                const newExp = {
                    title: req.body.title,
                    company: req.body.company,
                    location: req.body.location,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    description: req.body.description
                };

                profile.experience.unshift(newExp);

                profile.save().then(proile => res.json(profile));
            }
        )

});

//@route DELETE api/profile/experience/: exp_id
//@desc  Delete experience to profile
//@access private
route.delete('/experience/:exp_id',passport.authenticate('jwt',{session:false}),(req,res)=>{

    Profile.findOne({ user: req.user.id})
        .then(profile => {

                //Get Remove index
                const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

                // splice out of array
                profile.experience.splice(removeIndex,1);

                //save to db
                profile.save().then(profile => res.json(profile));
            }
        ).catch(err => res.status(404).json({profile: 'There is no profile for this user.'}));

});


//@route POST api/profile/education
//@desc  add education to profile
//@access private
route.post('/education',passport.authenticate('jwt',{session:false}),(req,res)=>{

    const { errors, isValid} = validateEducationInput(req.body);

    //Check Validation
    if( !isValid ) {
        //Return  any errors with status 400
        return res.status(400).json(errors);
    }


    Profile.findOne({ user: req.user.id})
        .then(
            profile => {

                const newEdu = {
                    school: req.body.school,
                    degree: req.body.degree,
                    fieldofstudy: req.body.fieldofstudy,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    description: req.body.description
                };

                profile.education.unshift(newEdu);

                profile.save().then(proile => res.json(profile));
            }
        )

});


//@route DELETE api/profile/education/: edu_id
//@desc  Delete education to profile
//@access private
route.delete('/eucation/:edu_id',passport.authenticate('jwt',{session:false}),(req,res)=>{

    Profile.findOne({ user: req.user.id})
        .then(profile => {

                //Get Remove index
                const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

                // splice out of array
                profile.education.splice(removeIndex,1);

                //save to db
                profile.save().then(profile => res.json(profile));
            }
        ).catch(err => res.status(404).json({profile: 'There is no profile for this user.'}));

});


//@route DELETE api/profile
//@desc  Delete User and profile
//@access private
route.delete('/',passport.authenticate('jwt',{session:false}),(req,res)=>{

    Profile.findOneAndRemove({ user: req.user.id})
        .then(profile => {
            User.findOneAndRemove({ _id : req.user.id })
                .then(() => res.json({ success: true}));
        }).catch(err => res.status(404).json({profile: 'There is no profile for this user.'}));

});



module.exports = route;