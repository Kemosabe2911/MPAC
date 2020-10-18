const express= require('express');
const app = express();
//const { pool }= require("./dbConfig");
const { Pool, Client } = require('pg')
const bcrypt= require('bcrypt');
const session= require('express-session');
const flash= require('express-flash');
const passport= require('passport');

const initializePassport = require("./passportConfig");

initializePassport(passport);

//Public Folder
app.use(express.static(__dirname+'/public'));

//DB Connect
const pool = new Pool({
    user: 'mpac_user',
    host: 'localhost',
    database: 'mpac_db',
    password: 'password',
    port: 5432,
  })

const PORT = process.env.PORT || 5000;

//EJS
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

app.get('/',checkAuthenticated,(req,res) =>{
    res.render("login");
});

//Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

app.get('/register',checkAuthenticated,(req,res) =>{
    res.render("register");
});


app.get('/logout',(req,res) =>{
    req.logout();
    req.flash("success_msg", "You have logged out");
    res.redirect('/');
});


app.get('/home',checkNotAuthenticated,(req,res) =>{
    res.render("index",{user: req.user.name});
});

//User Registration

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
             }else{
                 pool.query(
                     `INSERT INTO users (name, email, password, phno)
                     VALUES ($1, $2, $3, $4)
                     RETURNING u_id, password`, [name, email, hashedPassword, phno], (err, results)=>{
                         if(err){
                             throw err;
                         }
                         console.log(results.row);
                         req.flash('success_msg',"You are now registered. Please Login");
                         res.redirect('/');
                     }
                 )
             }
         }
    );
    }
});

//Login Validation

app.post('/',passport.authenticate("local",{
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}));

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return res.redirect("/home");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

//Get Requet Page: Sell-y3-cs-ss
app.get('/sell-y3-cs-ss',(req,res)=>{
    res.render('sell-y3-cs-ss');
});



//Port Console Log
app.listen(PORT, () =>{
    console.log(`Server Running on port ${PORT}`);
})