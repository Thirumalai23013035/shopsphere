const express = require("express")

const app = express()


const logger = (req,res,next)=>{

    console.log("request accepted");
    next();
}

// app.use(logger);

app.get("/home",logger,(req,res)=>{

    res.send("home open");
})

app.get("/products",(req,res)=>{
    res.send("Products opened");
})

app.listen(3000,()=>{

    console.log("server started");
})