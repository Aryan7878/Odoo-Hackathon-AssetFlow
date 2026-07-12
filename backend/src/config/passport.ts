import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const googleUser = {
            googleId: profile.id,
            email,
            firstName: profile.name?.givenName || 'Google',
            lastName: profile.name?.familyName || 'User',
            avatar: profile.photos?.[0]?.value,
          };

          const result = await authService.googleLogin(googleUser);
          return done(null, result);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  logger.info('Google OAuth strategy initialized successfully.');
} else {
  logger.warn('Google OAuth credentials not provided. Google Sign-In is disabled.');
}

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
