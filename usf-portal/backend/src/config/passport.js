const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let usuario = await User.findOne({ googleId: profile.id });
    if (!usuario) {
      usuario = await User.create({
        googleId: profile.id,
        nombre: profile.name.givenName,
        apellido: profile.name.familyName,
        email: profile.emails[0].value,
        foto: profile.photos[0]?.value,
        rol: 'alumno',
      });
    }
    return done(null, usuario);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((usuario, done) => done(null, usuario._id));
passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await User.findById(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
