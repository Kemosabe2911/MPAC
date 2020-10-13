const express= require('express');
const app = express();
const { pool }= require("./dbConfig");

const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

app.get('/',(req,res) =>{
    res.render("login");
});

app.get('/register',(req,res) =>{
    res.render("register");
});

app.get('/home',(req,res) =>{
    res.render("index",{user: "Stevin"});
});

app.post('/register',(req,res)=>{

    let {name, email, password, password2} = req.body;
    console.log({name,email,password,password2});
    //Error validation
    let errors= [];

    if(!name || !email || !password || !password2){
        errors.push({message: "Please enter all fields"});
    }

    if(password.length<6){
        errors.push({message: "Password should be atleast 6 charachters"});
    }

    if(password != password2){
        errors.push({message: "Passwords do not match"});
    }
});

app.listen(PORT, () =>{
    console.log(`Server Running on port ${PORT}`);
})