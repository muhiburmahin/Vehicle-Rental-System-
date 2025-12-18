import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express"
import config from "../config";

const auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized error ,token not found"
                });
            }

            const token = authHeader.split(" ")[1];
            const secret = config.jwt_secret as string;

            // Decode token
            const decoded = jwt.verify(token as string, secret) as JwtPayload & {
                id: number;
                email: string;
                role: string;
            };

            req.user = decoded;

            //check role
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden , role not found in token"
                })
            }
            next();
        }
        catch (error: any) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized error, Invalid token."
            });
        }
    };
};

export default auth;