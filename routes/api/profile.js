const express = require('express');
const route = express.Router();


//@route GET profile/api/test
//@desc Tests profile route
//@access public
route.get('/test',(req,res)=>{res.json({msg:"Profile playground"})});

module.exports = route;