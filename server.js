const express= require('express');
const app = express();
//const { pool }= require("./dbConfig");
const { Pool, Client } = require('pg')
const bcrypt= require('bcrypt');
const session= require('express-session');
const flash= require('express-flash');


const pool = new Pool({
    user: 'mpac_user',
    host: 'localhost',
    database: 'mpac_db',
    password: 'password',
    port: 5432,
  })

const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

app.use(
    session({
        secret: "secret",

        resave: false,

        saveUninitialized: false
    })
);

app.use(flash());

app.get('/',(req,res) =>{
    res.render("login");
});

app.get('/register',(req,res) =>{
    res.render("register");
});

app.get('/home',(req,res) =>{
    res.render("index",{user: "Stevin"});
});

app.post('/register', async (req,res)=>{

    let {name, email, phno, password, password2} = req.body;
    console.log({name,email,password,password2});
    //Error validation
    let errors= [];

    if(!name || !email || !password || !password2 || !phno){
        errors.push({message: "Please enter all fields"});
    }

    if(password.length<6){
        errors.push({message: "Password should be atleast 6 charachters"});
    }

    if(password != password2){
        errors.push({message: "Passwords do not match"});
    }

    if(errors.length>0){
        res.render('register',{ errors });
    }
    else{
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hello');
    pool.query(
        `SELECT * FROM users
         WHERE email= $1`,[email], (err, results)=>{
             if(err){
                 throw err;
             }
             console.log(results.rows);

             if( results.rows.length > 0){
                 errors.push({ message: "Email already registered"});
                 console.log('reaches here');
                 res.render('register', { errors });
             }
         }
    );
    }
});

app.listen(PORT, () =>{
    console.log(`Server Running on port ${PORT}`);
})