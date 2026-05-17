
import {expressjwt as jwt} from 'express-jwt';
import config from '../config.json';
import db from '../_helpers/db';
import {FileConfig} from '../_helpers/config-loader';
import {loadFileConfig} from '../_helpers/config-loader';


// Now this works
const fileConfig:FileConfig = process.env.NODE_ENV === 'production' ? {} : loadFileConfig();
const secret = process.env.JWT_SECRET || fileConfig.secret;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export default function authorize(roles: any = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret, algorithms: ['HS256'] }),

        async (req: any, res: any, next: any) => {
            try {
                const account = await db.Account.findByPk(req.auth.id);

                if (!account) {
                    return res.status(401).json({ message: 'Account not found' });
                }

                // role check
                if (roles.length && !roles.includes(account.role)) {
                    return res.status(403).json({ message: 'Forbidden' });
                }

                req.auth.role = account.role;

                const refreshTokens = await account.getRefreshTokens();
                req.auth.ownsToken = (token: any) =>
                    !!refreshTokens.find((x: any) => x.token === token);

                return next();
            } catch (err) {
                return next(err);
            }
        }
    ];
}