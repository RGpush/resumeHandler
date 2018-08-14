const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load post Model
const Post = require('../../models/Post');

//Load Profile Model
const Profile = require('../../models/Profile');

//Load Validation
const validatePostTextInput = require('../../validation/post');

//@route GET post/api/test
//@desc Tests post route
//@access public
route.get('/test',(req,res)=>{res.json({msg:"post playground"})});


//@route GET post/api/post
//@desc Get all posts
//@access public
route.get('/',(req, res) => {

    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ noPostsFoud: "No posts found."}));
});


//@route GET post/api/posts/:id
//@desc Get post by Id
//@access public
route.get('/:id',(req, res) => {

    Post.findById(req.params.id)
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ noPostFoud: "No post found with that ID."}));
});


//@route POST post/api/post
//@desc Create post
//@access private
route.post('/',passport.authenticate('jwt',{ session: false}),(req,res) => {

    const { errors, isValid } = validatePostTextInput(req.body);

    //check validation
    if(!isValid){
        //if any errors, send 400 with errors object
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});


//@route DELETE post/api/post
//@desc Delete post
//@access private
route.delete('/:id',passport.authenticate('jwt',{ session: false}),(req,res) => {

    Profile.findOne({ user: req.user.id})
        .then(pofile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check for post owner
                    if(post.user.toString() !== req.user.id){
                        return res.status(401).json({ notAuthorised: 'User not authorised.'})
                    }

                    //delete
                    post.remove().then(() => res.json({ success: true}))
                })
                .catch(err => res.status(404).json({ postNotFound: 'Post not found.'}))
        })

});


//@route POST post/api/post/like/:id
//@desc like post
//@access private
route.post('/like/:id',passport.authenticate('jwt',{ session: false}),(req,res) => {

    Profile.findOne({ user: req.user.id})
        .then(pofile => {
            Post.findById(req.params.id)
                .then(post => {
                   if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({ alreadyLiked: 'User already liked the post.' })
                   }

                   //Add user id to likes array
                    post.likes.unshift({ user: req.user.id});

                   //save to db
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postNotFound: 'Post not found.'}))
        })

});


//@route POST post/api/post/unlike/:id
//@desc unlike post
//@access private
route.post('/unlike/:id',passport.authenticate('jwt',{ session: false}),(req,res) => {

    Profile.findOne({ user: req.user.id})
        .then(pofile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notLikedYet: 'You have not yet liked the post.' })
                    }

                    //Get Remove INDEX
                    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

                    //remove from array
                    post.likes.splice(removeIndex, 1);

                    //save to db
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postNotFound: 'Post not found.'}))
        })

});


//@route POST post/api/post/comment/:id
//@desc Add comment to post
//@access private
route.post('/comment/:id', passport.authenticate('jwt', { session: false}), (req,res) => {

    const { errors, isValid } = validatePostTextInput(req.body);

    //check validation
    if(!isValid){
        //if any errors, send 400 with errors object
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {

            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            };

            //ADD to comments array
            post.comments.unshift(newComment);

            //Save to db
            post.save().then(post => res.json(post));
        }).catch(err => res.status(404).json({ postNotFound: 'Post not found.'}));
});


//@route DELETE post/api/post/comment/:id
//@desc delete comment to post
//@access private
route.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false}), (req,res) => {

    Post.findById(req.params.id)
        .then(post => {

            //check to see if the comment exist
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ commentNotExist: 'Comment does not exist'});
            }

            //removeIndex
            const removeIndex = post.comments.map(item => item._id).indexOf(req.params.comment_id);

            //Splice to comments array
            post.comments.splice(removeIndex, 1);

            //Save to db
            post.save().then(post => res.json(post));

        }).catch(err => res.status(404).json({ postNotFound: 'Post not found.'}));
});


module.exports = route;