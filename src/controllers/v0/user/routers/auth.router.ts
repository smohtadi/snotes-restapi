import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { config as c } from '../../../../config/config';
import User, { IUser } from '../models/user';

passport.use('GoogleStrategy', new GoogleStrategy({
    clientID: c.GOOGLE_CLIENT_ID,
    clientSecret: c.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user: IUser = await User.findOne({ googleId: profile.id });
        if (user) {
            done(null, user);
        } else {
            const new_user = await new User({ googleId: profile.id }).save();
            done(null, new_user);
        }
    } catch (error) {
        done(error);
    }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: c.JWT_SECRET
}, (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
        return done('jwt expired');
    }
    return done(null, jwtPayload);
}));
