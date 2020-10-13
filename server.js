const express= require('express');
const app = express();
const { pool }= require("./dbConfig");

const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');

app.get('/',(req,res) =>{
    res.render("login");
});

app.get('/register',(req,res) =>{
    res.render("register");
});

app.get('/home',(req,res) =>{
    res.render("index",{user: "Stevin"});
});

app.listen(PORT, () =>{
    console.log(`Server Running on port ${PORT}`);
})