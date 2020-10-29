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
const bodyparser= require('body-parser');
const nodemailer= require('nodemailer');



const initializePassport = require("./passportConfig");
const User_id = require('./passportConfig');
const { prependOnceListener } = require('process');

const test= require('./public/js/temp');
console.log(test);


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

// Body-parser middleware 
app.use(bodyparser.urlencoded({extended:false})) 
app.use(bodyparser.json()) 


const PORT = process.env.PORT || 4000;

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

app.get('/buy',checkNotAuthenticated,(req,res) =>{
    res.render("buy");
});



//User Registration

app.post('/register', async (req,res)=>{

    let {name, email, phno, password, password2} = req.body;
    phno_int= parseInt(phno);
    console.log({name,email,password,password2,phno_int});
    
    //Error validation
    let errors= [];

    if(!name || !email || !password || !password2 || !phno_int){
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
                     RETURNING u_id, password`, [name, email, hashedPassword, phno_int], (err, results)=>{
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


//Sell Year1 Books
app.get('/sell-y1-books',(req,res)=>{
    res.render('sell-y1-books');
});

app.post('/sell-y1-books',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});



//Sell Year2 CS Books
app.get('/sell-y2-cs',(req,res)=>{
    res.render('sell-y2-cs');
});

app.post('/sell-y2-cs',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y2-cs',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y2-cs',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=2;
                let branch="Computer Science";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Year2 CE Books
app.get('/sell-y2-ce',(req,res)=>{
    res.render('sell-y2-ce');
});

app.post('/sell-y2-ce',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y2-ce',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y2-ce',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=2;
                let branch="Civil Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Year2 ME Books
app.get('/sell-y2-me',(req,res)=>{
    res.render('sell-y2-me');
});

app.post('/sell-y2-me',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y2-me',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y2-me',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=2;
                let branch="Mechanical Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Year2 EE Books
app.get('/sell-y2-ee',(req,res)=>{
    res.render('sell-y2-ee');
});

app.post('/sell-y2-ee',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y2-ee',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y2-ee',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=2;
                let branch="Electrical Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Year2 EC Books
app.get('/sell-y2-ec',(req,res)=>{
    res.render('sell-y2-ec');
});

app.post('/sell-y2-ec',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y2-ec',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y2-ec',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=2;
                let branch="Electronics and Communication";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Year 3 Section

//Sell Year3 CS Books
app.get('/sell-y3-cs',(req,res)=>{
    res.render('sell-y3-cs');
});

app.post('/sell-y3-cs',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y3-cs',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y3-cs',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=3;
                let branch="Computer Science";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Year3 CE Books
app.get('/sell-y3-ce',(req,res)=>{
    res.render('sell-y3-ce');
});

app.post('/sell-y3-ce',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y3-ce',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y3-ce',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=3;
                let branch="Civil Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Year3 ME Books
app.get('/sell-y3-me',(req,res)=>{
    res.render('sell-y3-me');
});

app.post('/sell-y3-me',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y3-me',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y3-me',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=3;
                let branch="Mechanical Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Year3 EE Books
app.get('/sell-y3-ee',(req,res)=>{
    res.render('sell-y3-ee');
});

app.post('/sell-y3-ee',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y3-ee',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y3-ee',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=3;
                let branch="Electrical Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Year3 EC Books
app.get('/sell-y3-ec',(req,res)=>{
    res.render('sell-y3-ec');
});

app.post('/sell-y3-ec',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y3-ec',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y3-ec',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=3;
                let branch="Electronics and Communication";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Year 4 Section

//Sell Year4 CS Books
app.get('/sell-y4-cs',(req,res)=>{
    res.render('sell-y4-cs');
});

app.post('/sell-y4-cs',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y4-cs',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y4-cs',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=4;
                let branch="Computer Science";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Year4 CE Books
app.get('/sell-y4-ce',(req,res)=>{
    res.render('sell-y4-ce');
});

app.post('/sell-y4-ce',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y4-ce',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y4-ce',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=4;
                let branch="Civil Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Year4 ME Books
app.get('/sell-y4-me',(req,res)=>{
    res.render('sell-y4-me');
});

app.post('/sell-y4-me',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y4-me',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y4-me',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=4;
                let branch="Mechanical Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Year4 EE Books
app.get('/sell-y4-ee',(req,res)=>{
    res.render('sell-y4-ee');
});

app.post('/sell-y4-ee',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y4-ee',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y4-ee',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=4;
                let branch="Electrical Engineering";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Year4 EC Books
app.get('/sell-y4-ec',(req,res)=>{
    res.render('sell-y4-ec');
});

app.post('/sell-y4-ec',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-y4-ec',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-y4-ec',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, author, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let subject= req.body.selectpicker;
                let year=4;
                let branch="Electronics and Communication";
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
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO books (b_name, author, pages, year, branch, subject, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING b_id`,[bname, author, pages_int, year, branch, subject, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});


//Sell Tools

app.get('/sell-tools',(req,res)=>{
    res.render('sell-tools');
});


app.post('/sell-tools',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-tools',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-tools',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let branch= req.body.selectpicker;
                //let year=4;
                //let branch="Electronics and Communication";
                let price_int=parseInt(price);
                //let pages_int= parseInt(pages);
                
                console.log({bname,branch,price_int});
                console.log(req.file.filename);
                let file= req.file.filename;
                //Error validation
                let errors= [];

                if(!bname || !price || !file){
                    errors.push({message: "Please enter all fields"});
                }
                if(price_int === NaN){
                    errors.push({message: "Price and Pages must be numbers"});
                }
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO tools (t_name, branch, image, price, user_id )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING t_id`,[bname, branch, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell Calcs

app.get('/sell-calcs',(req,res)=>{
    res.render('sell-calcs');
});


app.post('/sell-calcs',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-calcs',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-calcs',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, pages, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                let type= req.body.selectpicker;
                //let year=4;
                //let branch="Electronics and Communication";
                let price_int=parseInt(price);
                //let pages_int= parseInt(pages);
                
                console.log({bname,pages,price_int});
                console.log(req.file.filename);
                let file= req.file.filename;
                //Error validation
                let errors= [];

                if(!bname || !price || !file){
                    errors.push({message: "Please enter all fields"});
                }
                if(price_int === NaN){
                    errors.push({message: "Price and Pages must be numbers"});
                }
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO calculators (c_name, power, image, price, user_id, c_type )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING c_id`,[bname, pages, req.file.filename, price_int, req.user.u_id, type],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Sell extras

app.get('/sell-exts',(req,res)=>{
    res.render('sell-exts');
});


app.post('/sell-exts',(req,res) =>{    
    upload(req,res,(err) =>{
        console.log('Working');
        if(err){
            console.log('Here1');
            res.render('sell-exts',{msg:err});
        }
        else{
            if(req.file == undefined){
                console.log('Here2');
                res.render('sell-exts',{
                    msg: 'Error: No File Selected!'
                });
            }else{
                //console.log('Here3');
                let {bname, price} = req.body;
                //console.log('Here3');
                //console.log(req.body.selectpicker);
                //let type= req.body.selectpicker;
                //let year=4;
                //let branch="Electronics and Communication";
                let price_int=parseInt(price);
                //let pages_int= parseInt(pages);
                
                console.log({bname,price_int});
                console.log(req.file.filename);
                let file= req.file.filename;
                //Error validation
                let errors= [];

                if(!bname || !price || !file){
                    errors.push({message: "Please enter all fields"});
                }
                if(price_int === NaN){
                    errors.push({message: "Price and Pages must be numbers"});
                }
                console.log('Here 4');
                //Insert into db
                pool.query(
                    `INSERT INTO extras (e_name, image, price, user_id)
                    VALUES ($1, $2, $3, $4)
                    RETURNING e_id`,[bname, req.file.filename, price_int, req.user.u_id],(err,results) =>{
                        if(err){
                            throw err;
                        }
                        console.log(results.row);
                        console.log("success");
                    }
                )
                res.redirect('/home');
                //res.render('sell-y1-books',{ errors });
            }
        }
    });

});

//Buy Section

//Buy Year1 Books
app.get('/buy-y1-books',(req,res)=>{
    res.render('buy-y1-books');
});

app.post('/buy-y1-books',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=1 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );

});

//Buy Year2 CE Books
app.get('/buy-y2-ce',(req,res)=>{
    res.render('buy-y2-ce');
});

app.post('/buy-y2-ce',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=2 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );

});

//Buy Year2 CS Books
app.get('/buy-y2-cs',(req,res)=>{
    res.render('buy-y2-cs');
});

app.post('/buy-y2-cs',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=2 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );

});

//Buy Year2 EC Books
app.get('/buy-y2-ec',(req,res)=>{
    res.render('buy-y2-ec');
});

app.post('/buy-y2-ec',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=2 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );

});

//Buy Year2 EE Books
app.get('/buy-y2-ee',(req,res)=>{
    res.render('buy-y2-ee');
});

app.post('/buy-y2-ee',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=2 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );
});

//Buy Year2 ME Books
app.get('/buy-y2-me',(req,res)=>{
    res.render('buy-y2-me');
});



//Buy Year3 CE Books
app.get('/buy-y3-ce',(req,res)=>{
    res.render('buy-y3-ce');
});

//Buy Year3 CS Books
app.get('/buy-y3-cs',(req,res)=>{
    res.render('buy-y3-cs');
});

//Buy Year3 EC Books
app.get('/buy-y3-ec',(req,res)=>{
    res.render('buy-y3-ec');
});

//Buy Year3 EE Books
app.get('/buy-y3-ee',(req,res)=>{
    res.render('buy-y3-ee');
});

//Buy Year3 ME Books
app.get('/buy-y3-me',(req,res)=>{
    res.render('buy-y3-me');
});

app.post('/buy-y3',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=3 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );
});


//Buy Year4 CE Books
app.get('/buy-y4-ce',(req,res)=>{
    res.render('buy-y4-ce');
});

//Buy Year4 CS Books
app.get('/buy-y4-cs',(req,res)=>{
    res.render('buy-y4-cs');
});

//Buy Year4 EC Books
app.get('/buy-y4-ec',(req,res)=>{
    res.render('buy-y4-ec');
});

//Buy Year4 EE Books
app.get('/buy-y4-ee',(req,res)=>{
    res.render('buy-y4-ee');
});

//Buy Year4 ME Books
app.get('/buy-y4-me',(req,res)=>{
    res.render('buy-y4-me');
});

app.post('/buy-y4',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM books
        WHERE year=4 AND subject='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-books',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );
});


//Buy Tools
app.get('/buy-tools',(req,res)=>{
    res.render('buy-tools');
});

app.post('/buy-tools',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM tools
        WHERE branch='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-tools',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );
});

//Buy calculators
app.get('/buy-calcs',(req,res)=>{
    res.render('buy-calcs');
});

app.post('/buy-calcs',(req,res) =>{    
    let subject= req.body.selectpicker;
    console.log({subject});
    pool.query(
        `SELECT * FROM calculators
        WHERE c_type='${subject}'`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-calc',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );
});

//Buy Extras

app.get('/buy-exts',(req,res)=>{
    pool.query(
        `SELECT * FROM extras`,(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('purchase-exts',{
                datas: results.rows
            });
            /*res.render("index",{
                imgs: results.rows
                //img: `/uploads/${results.rows[0].img}`
            });*/
        }
    );
});



//Purchase Books
app.post('/purchase-books',(req,res) =>{
    //let prod= req.body.prod;
    let prod= req.body.prod;
    console.log(prod);

    console.log(req.user);
    console.log(req.body);
    pool.query(`SELECT * FROM users WHERE u_id= $1`,[req.body.user], (err, results) =>{
        if(err){
            throw err;
        }
        let seller=results.rows
        console.log(seller[0]);   
    const output= `
    <h2> MPAC Purchase Confirmation Mail</h2>
    <ul>
        <li>Book Name: ${req.body.bname}</li>
        <li>Author: ${req.body.author}</li>
        <li>Subject: ${req.body.subject}</li>
        <li>Pages: ${req.body.pages}</li>
        <li>Price: ${req.body.price}</li>
    </ul>
    <img style="width:300px; height: 300px;"  src="cid:logo" alt="Image Not available">
    <h3>Seller Info:<h3>
    <ul>
        <li>Seller Name: ${seller[0].name}</li>
        <li>Seller Email: ${seller[0].email}</li>
        <li>Seller Ph.No: ${seller[0].phno}</li>
    </ul>
    <br>
    <h3>Buyer Info:<h3>
    <ul>
        <li>Buyer Name: ${req.user.name}</li>
        <li>Buyer Email: ${req.user.email}</li>
        <li>Buyer Ph.No: ${req.user.phno}</li>
    </ul>
    `;
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
        user: 'itsmestevin29@gmail.com', // generated ethereal user
        pass: 'stevin@2911', // generated ethereal password
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    let info = transporter.sendMail({
        from: '"MPAC" <itsmestevin29@gmail.com>', // sender address
        to: `${req.user.email}, ${seller[0].email}`, // list of receivers
        subject: "MPAC Purchase Confirmation", // Subject line
        text: "Hello world?", // plain text body
        html: output,
        attachments: [{
            filename: `${req.body.image}`,
            path: __dirname +`/public/uploads/${req.body.image}`,
            cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
       }]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));


    });

    pool.query(` DELETE FROM bookcart WHERE p_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
    });

    pool.query(` DELETE FROM books WHERE b_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
        res.redirect("/home");
    });
});


//Cart books
app.post('/cart-books',(req,res) =>{
    let prod= req.body.prod;
    console.log(prod);
    pool.query(
        `INSERT INTO bookcart (user_id,p_id)
        VALUES ($1, $2)
        RETURNING bc_id`, [req.user.u_id, prod], (err, results)=>{
            if(err){
                throw err;
            }
            console.log(results.row);
            res.redirect('/home');
        }
    );
});


//Purchase Tools
app.post('/purchase-tools',(req,res) =>{
    //let prod= req.body.prod;
    let prod= req.body.prod;
    console.log(prod);

    console.log(req.user);
    console.log(req.body);
    pool.query(`SELECT * FROM users WHERE u_id= $1`,[req.body.user], (err, results) =>{
        if(err){
            throw err;
        }
        let seller=results.rows
        console.log(seller[0]);   
    const output= `
    <h2> MPAC Purchase Confirmation Mail</h2>
    <ul>
        <li>Tool Name: ${req.body.bname}</li>
        <li>Branch: ${req.body.subject}</li>
        <li>Price: ${req.body.price}</li>
    </ul>
    <img style="width:300px; height: 300px;"  src="cid:logo" alt="Image Not available">
    <h3>Seller Info:<h3>
    <ul>
        <li>Seller Name: ${seller[0].name}</li>
        <li>Seller Email: ${seller[0].email}</li>
        <li>Seller Ph.No: ${seller[0].phno}</li>
    </ul>
    <br>
    <h3>Buyer Info:<h3>
    <ul>
        <li>Buyer Name: ${req.user.name}</li>
        <li>Buyer Email: ${req.user.email}</li>
        <li>Buyer Ph.No: ${req.user.phno}</li>
    </ul>
    `;
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
        user: 'itsmestevin29@gmail.com', // generated ethereal user
        pass: 'stevin@2911', // generated ethereal password
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    let info = transporter.sendMail({
        from: '"MPAC" <itsmestevin29@gmail.com>', // sender address
        to: `${req.user.email}, ${seller[0].email}`, // list of receivers
        subject: "MPAC Purchase Confirmation", // Subject line
        text: "Hello world?", // plain text body
        html: output,
        attachments: [{
            filename: `${req.body.image}`,
            path: __dirname +`/public/uploads/${req.body.image}`,
            cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
       }]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));


    });
    pool.query(` DELETE FROM toolcart WHERE p_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
    });
    pool.query(` DELETE FROM tools WHERE t_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
        res.redirect("/home");
    });
});


//Cart Tools
app.post('/cart-tools',(req,res) =>{
    let prod= req.body.prod;
    console.log(prod);
    pool.query(
        `INSERT INTO toolcart (user_id,p_id)
        VALUES ($1, $2)
        RETURNING tc_id`, [req.user.u_id, prod], (err, results)=>{
            if(err){
                throw err;
            }
            console.log(results.row);
            res.redirect('/home');
        }
    );
});


//Purchase Calculators
app.post('/purchase-calcs',(req,res) =>{
    //let prod= req.body.prod;
    let prod= req.body.prod;
    console.log(prod);

    console.log(req.user);
    console.log(req.body);
    pool.query(`SELECT * FROM users WHERE u_id= $1`,[req.body.user], (err, results) =>{
        if(err){
            throw err;
        }
        let seller=results.rows
        console.log(seller[0]);   
    const output= `
    <h2> MPAC Purchase Confirmation Mail</h2>
    <ul>
        <li>Calculator Name: ${req.body.bname}</li>
        <li>Type: ${req.body.subject}</li>
        <li>Power: ${req.body.power}</li>
        <li>Price: ${req.body.price}</li>
    </ul>
    <img style="width:300px; height: 300px;"  src="cid:logo" alt="Image Not available">
    <h3>Seller Info:<h3>
    <ul>
        <li>Seller Name: ${seller[0].name}</li>
        <li>Seller Email: ${seller[0].email}</li>
        <li>Seller Ph.No: ${seller[0].phno}</li>
    </ul>
    <br>
    <h3>Buyer Info:<h3>
    <ul>
        <li>Buyer Name: ${req.user.name}</li>
        <li>Buyer Email: ${req.user.email}</li>
        <li>Buyer Ph.No: ${req.user.phno}</li>
    </ul>
    `;
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
        user: 'itsmestevin29@gmail.com', // generated ethereal user
        pass: 'stevin@2911', // generated ethereal password
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    let info = transporter.sendMail({
        from: '"MPAC" <itsmestevin29@gmail.com>', // sender address
        to: `${req.user.email}, ${seller[0].email}`, // list of receivers
        subject: "MPAC Purchase Confirmation", // Subject line
        text: "Hello world?", // plain text body
        html: output,
        attachments: [{
            filename: `${req.body.image}`,
            path: __dirname +`/public/uploads/${req.body.image}`,
            cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
       }]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));


    });
    pool.query(` DELETE FROM calccart WHERE p_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
    });
    pool.query(` DELETE FROM calculators WHERE c_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
        res.redirect("/home");
    });
});


//Cart Calcs
app.post('/cart-calcs',(req,res) =>{
    let prod= req.body.prod;
    console.log(prod);
    pool.query(
        `INSERT INTO calccart (user_id,p_id)
        VALUES ($1, $2)
        RETURNING cc_id`, [req.user.u_id, prod], (err, results)=>{
            if(err){
                throw err;
            }
            console.log(results.row);
            res.redirect('/home');
        }
    );
});


//Purchase Extras
app.post('/purchase-exts',(req,res) =>{
    //let prod= req.body.prod;
    let prod= req.body.prod;
    console.log(prod);

    console.log(req.user);
    console.log(req.body);
    pool.query(`SELECT * FROM users WHERE u_id= $1`,[req.body.user], (err, results) =>{
        if(err){
            throw err;
        }
        let seller=results.rows
        console.log(seller[0]);   
    const output= `
    <h2> MPAC Purchase Confirmation Mail</h2>
    <ul>
        <li>Product Name: ${req.body.bname}</li>
        <li>Price: ${req.body.price}</li>
    </ul>
    <img style="width:300px; height: 300px;"  src="cid:logo" alt="Image Not available">
    <h3>Seller Info:<h3>
    <ul>
        <li>Seller Name: ${seller[0].name}</li>
        <li>Seller Email: ${seller[0].email}</li>
        <li>Seller Ph.No: ${seller[0].phno}</li>
    </ul>
    <br>
    <h3>Buyer Info:<h3>
    <ul>
        <li>Buyer Name: ${req.user.name}</li>
        <li>Buyer Email: ${req.user.email}</li>
        <li>Buyer Ph.No: ${req.user.phno}</li>
    </ul>
    `;
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
        user: 'itsmestevin29@gmail.com', // generated ethereal user
        pass: 'stevin@2911', // generated ethereal password
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    let info = transporter.sendMail({
        from: '"MPAC" <itsmestevin29@gmail.com>', // sender address
        to: `${req.user.email}, ${seller[0].email}`, // list of receivers
        subject: "MPAC Purchase Confirmation", // Subject line
        text: "Hello world?", // plain text body
        html: output,
        attachments: [{
            filename: `${req.body.image}`,
            path: __dirname +`/public/uploads/${req.body.image}`,
            cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
       }]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));


    });
    pool.query(` DELETE FROM extcart WHERE p_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
    });
    pool.query(` DELETE FROM extras WHERE e_id = $1`, [prod], (err, results) =>{
        if(err){
            throw err;
        }
        console.log(results.rows);
        res.redirect("/home");
    });
});


//Cart Extras
app.post('/cart-exts',(req,res) =>{
    let prod= req.body.prod;
    console.log(prod);
    pool.query(
        `INSERT INTO extcart (user_id,p_id)
        VALUES ($1, $2)
        RETURNING ec_id`, [req.user.u_id, prod], (err, results)=>{
            if(err){
                throw err;
            }
            console.log(results.row);
            res.redirect('/home');
        }
    );
});


//My Cart

app.get('/my-cart',(req,res) =>{
    //console.log(req.user);
    pool.query(
        `SELECT * FROM books 
         WHERE b_id IN (
             SELECT p_id FROM bookcart
             WHERE user_id= $1
         ) `,[req.user.u_id],(err, results) =>{
             if(err){
                 throw err;
             }
             let books= results.rows;
             //console.log(books);
             pool.query(
                `SELECT * FROM tools 
                WHERE t_id IN (
                    SELECT p_id FROM toolcart
                    WHERE user_id= $1
                ) `,[req.user.u_id],(err, results) =>{
                    if(err){
                        throw err;
                    }
                    let tools= results.rows;
                    //console.log(books);
                    //console.log(tools);
                    pool.query(
                        `SELECT * FROM calculators 
                        WHERE c_id IN (
                            SELECT p_id FROM calccart
                            WHERE user_id= $1
                        ) `,[req.user.u_id],(err, results) =>{
                            if(err){
                                throw err;
                            }
                            let calcs= results.rows;
                            //console.log(calcs);
                            pool.query(
                                `SELECT * FROM extras 
                                WHERE e_id IN (
                                    SELECT p_id FROM extcart
                                    WHERE user_id= $1
                                ) `,[req.user.u_id],(err, results) =>{
                                    if(err){
                                        throw err;
                                    }
                                    let exts= results.rows;
                                    console.log(books);
                                    console.log(tools);
                                    console.log(calcs);
                                    console.log(exts);
                                    res.render('my-cart',{
                                                books: books,
                                                tools: tools,
                                                calcs: calcs,
                                                exts: exts
                                            });
                                }
                            );
                        }
                    );
                }
            );
         }
    );
    //console.log(books);

});

//Remove Product from cart

app.post('/cart-remove-books', (req,res) =>{
    let prod= req.body.prod;
    poo.query(
        `DELETE FROM bookcart
        WHERE user_id= $1 AND p_id= $2`, [req.user.u_id, prod],(err,results) =>{
            if(err){
                throw err;
            }
            console.log(results.rows);
        }
    )

});

app.post('/cart-remove-tools', (req,res) =>{
    let prod= req.body.prod;
    poo.query(
        `DELETE FROM toolcart
        WHERE user_id= $1 AND p_id= $2`, [req.user.u_id, prod],(err,results) =>{
            if(err){
                throw err;
            }
            console.log(results.rows);
        }
    )

});



//Port Console Log
app.listen(PORT, () =>{
    console.log(`Server Running on port ${PORT}`);
})