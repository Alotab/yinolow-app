
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();


if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

// const JWT_SECRET = (process.env.JWT_SECRET || "change_me") as string;

export const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "15m";
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";


export function signAccessToken(userId: string) {
    const jti = uuidv4();
    const token = jwt.sign({ id: userId, jti }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });    
    return { token, jti};
};


export function signRefreshToken(userId: string) {
    const jti = uuidv4();
    const token = jwt.sign({ id: userId, jti}, JWT_SECRET, {expiresIn: REFRESH_EXPIRES_IN})
    return { token, jti}
};

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as {id: string; jti: string; iat?: number; exp?: number};
}



export function signToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN});
}