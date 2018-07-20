const express = require('express');
const route = express.Router();

//@route GET post/api/test
//@desc Tests post route
//@access public
route.get('/test',(req,res)=>{res.json({msg:"post playground"})});

module.exports = route;