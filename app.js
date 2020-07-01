const express = require("express");

const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");
const indexRoutes = require("./routes/index");

const app = express();

app.use(bodyParser.json());
//CORS setup
app.use((req,res,next)=>{
    res.setHeader('Acess-Controll-Allow-Origin','*');
    res.setHeader('Acess-Controll-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Acess-Controll-Allow-Headers','Content-Type,Authorization');
    next();
})

app.use("/feed", feedRoutes);
app.use(indexRoutes);

app.listen(8080);
