const express = require('express');
const session = require('express-session');
const passport = require('passport');
const auth0Strategy = require('passport-auth0');
const students = require('./students.json');
require('dotenv').config();



const app = express();
app.use( session({
    secret: 'hide yo kids, hide yo wife obviously we have a rapist in Linkin Park',
    resave: false,
    saveUninitialized: false
}));

app.use( passport.initialize() );
app.use( passport.session() );

passport.use( new auth0Strategy({
    domain: process.env.DOMAIN,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/login',
    scope: "openid email profile"
},
function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
}   
) );

passport.serializeUser( (user, done) => {
    done(null, { clientID: user.id, email: user._json.email, name: user._json.name} )
});

passport.deserializeUser( (obj, done) => {
    done( null, obj );
});

app.get( '/login',
    passport.authenticate('auth0',
        { successRedirect: '/students', failureRedirect: '/login', connection: 'github' }
    )
);

function authenticated (req, res, next) {
    if( req.user ) {
        next()
    } else {
        res.sendStatus(401);
    }
}
app.get('/students', authenticated, ( req, res, next ) => {
    res.status(200).send(students)
});

const port = 3001;
app.listen( port, () => { console.log(`Server is  LIT FAM ${port}`); } );