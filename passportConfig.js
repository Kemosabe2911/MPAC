const LocalStrategy = require('passport-local').Strategy;
const { Pool, Client } = require('pg');
const bcrypt= require('bcrypt');
const { authenticate } = require('passport');

const pool = new Pool({
    user: 'mpac_user',
    host: 'localhost',
    database: 'mpac_db',
    password: 'password',
    port: 5432,
  })

function initialize(passport){
    const authenticateUser=(email, password, done)=>{
        pool.query(
            `SELECT * FROM users WHERE email= $1`,[email], (err, results) =>{
                if(err){
                    throw err;
                }
                console.log(results.rows);

                if(results.rows.length >0) {
                    const user = results.row[0];

                    bcrypt.compare(password. user.password, (err, isMatch)=>{
                        if(err){
                            throw err;
                        }

                        if (isMatch) {
                            return done(null, user);
                        }
                        else{
                            return done(null, false, {message: "Password is not correct"});
                        }
                    });

                }
                else{
                    return done(null, false, {message: "Email is not registered"});
                }
            }
        )
    }

    passport.use(
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password"
            },
            authenticateUser 
        )
    );

    passport.serializeuser((user,done) => done(null, user.id));

    passport.deserializeuser((id,done) =>{
        pool.query(
            `SELECT * FROM users
            WHERE id= $1`,[id], (err, results) => {
                if(err){
                    throw err;
                }
                return done(null, results.rows[0]);
            }
        );
    });
}  

module.exports= initialize;