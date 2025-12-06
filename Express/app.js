const express = require('express');
const userRoute = require('./routes/userRoute')
const mongoose = require('mongoose');

  

const app = express();


// Connect to MongoDB
mongoose.connect('mongodb+srv://Abassiddrisu9222:4wG8rJeq4B08XXnz@cluster0.pjsxd8e.mongodb.net/Ecommerce').then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

app.use(express.json());


app.use("/",userRoute);



app.listen(4000,()=>{

    console.log(`127.0.0.1:4000`)
})


