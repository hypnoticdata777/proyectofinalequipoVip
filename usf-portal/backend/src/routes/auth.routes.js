const express = require('express');
const router = express.Router();
const passport = require('passport');
const { iniciarGoogle, callbackGoogle, getMe, logout } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/google', iniciarGoogle);
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }), callbackGoogle);
router.get('/me', verifyToken, getMe);
router.post('/logout', logout);

module.exports = router;
