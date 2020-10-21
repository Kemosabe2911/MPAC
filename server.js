const express= require('express');
const app = express();
//const { pool }= require("./dbConfig");
const { Pool, Client } = require('pg')
const bcrypt= require('bcrypt');
const session= require('express-session');
const flash= require('express-flash');
const passport= require('passport');
const multer= require('multer');
const path= require('path');

const initializePassport = require("./passportConfig");
const User_id = require('./passportConfig');


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
    const user_id= req.user.u_id;
    console.log(req.user.u_id);
});

app.get('/dashboard',checkNotAuthenticated,(req,res) =>{
    res.render("dashboard",{
        name: req.user.name,
        email: req.user.email,
        phno: req.user.phno
    });
});

app.get('/sell',checkNotAuthenticated,(req,res) =>{
    res.render("sell");
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
    //console.log('Hello');
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




//Set Storage Engine
const storage= multer.diskStorage({
    destination: './public/uploads',
    filename: function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Init Upload
const upload= multer({
    storage: storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('pImage');

//Check File Type
function checkFileType(file,cb){
    //Allowed ext
    const filetypes= /jpeg|jpg|png|gif/;
    //Check ext
    const extname= filetypes.test(path.extname(file.originalname).toLowerCase());
    //Check mime
    const mimetype= filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    }else{
        cb("Error: Only Images!!!");
    }
}

//Get Requet Page: Sell-y3-cs-ss
app.get('/sell-y1-books',(req,res)=>{
    res.render('sell-y1-books');
});

app.post('/sell-y1-books',(req,res) =>{    
    upload(req,res,(err) =>{
        //console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y1-books',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y1-books',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=1;
                let branch="General";
                let price_int=parseInt(price);
                let pages_int= parseInt(pages);
                
                console.log({bname,author,subject,year,branch,pages_int,price_int});
                console.log(req.file.filename);
                let file= req.file.filename;
                //Error validation
                let errors= [];

                if(!bname || !author || !price || !pages || !file){
                    errors.push({message: "Please enter all fields"});
                }
                if(pages_int === NaN || price_int === NaN){
                    errors.push({message: "Price and Pages must be numbers"});
                }
                //console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $#, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Port Console Log
app.listen(PORT, () =>{
    console.log(`Server Running on port ${PORT}`);
})