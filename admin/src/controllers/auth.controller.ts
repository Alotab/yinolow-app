import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User";
import { signAccessToken, signRefreshToken, verifyToken, signToken } from "../lib/jwt";
import { storeRefreshToken, revokeRefreshToken, isRefreshTokenValid, blacklistAccessToken} from "./auth.tokens";
import { logger } from "../utils/logger";
import { mergeGuestWishlist } from "./wishlist.controller";

dotenv.config();


// Helpers 
function secondUntilExpiry(tokenPayload: any) {
    if (!tokenPayload.exp || !tokenPayload.iat) return 0
    return tokenPayload.exp - tokenPayload.iat;
};

/** LOGIN — returns access + refresh tokens and stores refresh jti in Redis */
export async function login(req: Request, res: Response) {
  try {
    const { email, password, guestId } = req.body; // 👈 include guestId from frontend
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Create tokens
    const { token: accessToken, jti: accessJti } = signAccessToken(user._id.toString(), user.email, user.role);
    const { token: refreshToken, jti: refreshJti } = signRefreshToken(user._id.toString(), user.email, user.role);

    // ✅ Compute TTL for refresh token
    const payload = jwt.decode(refreshToken) as any;
    const ttlSeconds =
      payload && payload.exp && payload.iat ? payload.exp - payload.iat : 60 * 60 * 24 * 7;

    // ✅ Store refresh token JTI in Redis
    await storeRefreshToken(refreshJti, user._id.toString(), ttlSeconds);

    // 🪄 Merge guest wishlist into user’s account (if guestId provided)
    if (guestId) {
      try {
        await mergeGuestWishlist(guestId, user._id.toString());
      } catch (mergeErr) {
        logger.warn(`Wishlist merge failed for guestId ${guestId}: ${mergeErr}`);
      }
    }

    // ✅ Respond
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.error("Error during login", err);
    return res.status(500).json({ message: "Server error" });
  }
}


/** REFRESH — rotate refresh token */
export async function refreshToken(req: Request, res: Response) {
    logger.info("Refresh token endpoint hit...");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "refreshToken required"});

        // verify signature
        let payload;
        try {
            payload = verifyToken(refreshToken); // throws if invalid
        } catch (err: any) {
            return res.status(401).json({ 
                message: "Invalid refresh token",
                detail: err.message
            });
        }

        const { id: userId, jti: oldRefreshJti } = payload;

        // check redis whether this jti is valid (rotation)
        const valid = await isRefreshTokenValid(oldRefreshJti);
        if (!valid) {
            return res.status(401).json({ message: "Refresh token revoked or already used"});
        }

        // rotate: revoke old refresh token
        await revokeRefreshToken(oldRefreshJti);

        // issue new tokens
        const { token: accessToken, jti: accessJti } = signAccessToken(userId);
        const { token: newRefreshToken, jti: newRefreshJti } = signRefreshToken(userId)

        // store new refresh jti 
        const newPayload = jwt.decode(newRefreshToken) as any;
        const newTtl = newPayload && newPayload.exp && newPayload.iat ? newPayload.exp - newPayload.iat : 60 * 60 * 24 * 7;
        await storeRefreshToken(newRefreshJti, userId, newTtl);

        return res.json({ accessToken, refreshToken: newRefreshToken });

    } catch (err) {
        logger.error(err);
        return res.status(500).json({ message: "Server error"});
    }
}

/** LOGOUT — revoke refresh token and optionally blacklist access token */
export async function logout(req: Request, res: Response) {
    try{

        const { refreshToken, accessToken } = req.body;
        if (refreshToken) {
            try {
                const payload = verifyToken(refreshToken);
                const { jti } = payload;
                await revokeRefreshToken(jti);
            }catch (err) {
                // ignore invalid token on logout
            }
        }

        // blacklist access token jti for emaining TTL (if provided)
        if (accessToken) {
            try {
                const payload = jwt.verify(accessToken, process.env.JWT_SECRET || "change_me") as any;
                const { jti, exp, iat } = payload;
                const ttl = exp && iat ? exp - iat : 0;
            if (ttl > 0) {
                await blacklistAccessToken(jti, ttl);
                }
            } catch (err) {
                // invalid access token — nothing to blacklist
            }
        }
    } catch (err){
        logger.warn("Error from Server");
        return res.status(500).json({ message: "Server error"});
    }
}

/** REGISTER  */
export async function register(req: Request, res: Response) {
    try {

        const { name, email, password, role } = req.body;
        if (!name || !email || !password ) return res.status(400).json({ message: "Missing fields"});

        const existing = await User.findOne( { email });
        if (existing) return res.status(409).json({ message: "Email already"});

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = new User({ name, email, password: hash, role: role || "user"});
        await user.save();

        const token = signToken(user._id.toString());
        return res.status(201).json({
            token,
            user: {
                id: user._id, 
                email: user.email, 
                name: user.name, 
                role: user.role
            }
        });

    } catch (err) {
        logger.warn("Server Error");
        return res.status(500).json({ message: "Server error" });
    }
}

export async function me(req: Request & { user?: any }, res: Response) {
  const u = (req as any).user;
  if (!u) return res.status(401).json({ message: "Unauthorized" });
  res.json({ user: u });
}





/** LOGIN — returns access + refresh tokens and stores refresh jti in Redis */
// export async function login(req: Request, res: Response) {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) return res.status(400).json({ message: "Missing fields"});

//         const user = await User.findOne({ email });
//         if (!user)  return res.status(401).json({ message: "Invalid credentials"});
//         const valid = await user.comparePassword(password);
//         if (!valid) return res.status(401).json({ message: "Inavliad credentials" });

//         // create tokens
//         const { token: accessToken, jti: accessJti } = signAccessToken(user._id.toString());
//         const  {token: refreshToken, jti: refreshJti } = signRefreshToken(user._id.toString());

//         // parse refresh token to compute TTL in seconds
//         const payload = jwt.decode(refreshToken) as any;
//         const ttlSeconds = payload && payload.exp && payload.iat ? payload.exp - payload.iat : 60 * 60 * 24 * 7;

//         // store refresh jti in redis
//         await storeRefreshToken(refreshJti, user._id.toString(), ttlSeconds);

//         return res.json({
//             user: { id: user._id, name: user.name, email: user.email, role: user.role},
//             accessToken,
//             refreshToken
//         });
//     }catch (err) {
//         logger.warn("Error");
//         return res.status(500).json({ message: "Server error"})
//     }
// }
