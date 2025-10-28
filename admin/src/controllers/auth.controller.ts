import { Request, Response } from "express";
import bycrpt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";
import { storeRefreshToken, revokeRefreshToken, isRefreshTokenValid, blacklistAccessToken} from "./auth.tokens";
import { redis } from "../lib/redis";
const logger = require("../utils/logger");

dotenv.config();

// Helpers 
function secondUntilExpiry(tokenPayload: any) {
    if (!tokenPayload.exp || !tokenPayload.iat) return 0
    return tokenPayload.exp - tokenPayload.iat;
};


/** LOGIN — returns access + refresh tokens and stores refresh jti in Redis */





