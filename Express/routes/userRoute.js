const express = require("express");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();



// Register User
router.post("/register",async(req,res)=>{
    
    try{
        const { email, username, password } = req.body;

        //  Test Data Start
        // username = "admin";
        // email = "admin@gmail.com";
        // password = "admin123";
        // Test Data End

        const hashedPassword = await bcrypt.hash(password, 10);
        const emailExists = await userModel.findOne({email});
        if(emailExists){
            return res.status(400).json({message:"Email Already Registered"});
        }
        const usernameExists = await userModel.findOne({username});
        if(usernameExists){
            return res.status(400).json({message:"Username Already Taken"});
        }
        const newUser = new userModel({email, username, password: hashedPassword});
        await newUser.save();
        res.status(201).json({message:"User Registered Successfully", user:newUser});
    }catch(err){
        res.status(500).json({message:"Error Registering User"});
    }

});

// Login User With JWT
router.post("/login",async(req,res)=>{

    const {email,password} = req.body;

    try{
        const user = await userModel.findOne({email});
        if(user && await bcrypt.compare(password, user.password)){
            const token = jwt.sign({ id: user._id }, "mysecrettoken", { expiresIn: "1h" });
            res.status(200).json({message:"Login Successful", user:user, access:token});

        }else{
            res.status(401).json({message:"Invalid Credentials"});
        }
    }catch(err){
        res.status(500).json({message:"Error Logging In"});
    }
});



// refresh token
router.post("/refresh-token",(req,res)=>{
    const { token } = req.body;
    if(!token){
        return res.status(401).json({message:"No Token Provided"});
    }
    try {
        const decoded = jwt.verify(token, "mysecrettoken");
        const newToken = jwt.sign({ id: decoded.id }, "mysecrettoken", { expiresIn: "1h" });
        res.status(200).json({ access: newToken });
    } catch (err) {
        res.status(403).json({message:"Invalid Token"});
    }
});

// JWT Authentication Middleware
const authenticateJWT = (req,res,next)=>{
    const authHeader = req.headers.authorization;


   if(authHeader){

 if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];

    jwt.verify(token, "mysecrettoken", (err, user) => {
        if (err) return res.sendStatus(403);

        req.user = user;
        next();
    });


   }else{
        res.status(403).json({message:"Forbidden"});
    }
};


// user profile
router.get("/profile",authenticateJWT,async(req,res)=>{
    try{
        
        const user = await userModel.findById(req.user.id).select("-password");
        if(user){
            res.status(200).json({user});
        }else{
            res.status(404).json({message:"User Not Found"});
        }
    }catch(err){
        res.status(500).json({message:"Error Fetching User Profile"});
    }
});

// test route



router.get("/",(req,res)=>{


    res.send("I Am The Server ,How ARe You Doing")

})

module.exports = router;