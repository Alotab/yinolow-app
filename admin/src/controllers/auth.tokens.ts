import { redis } from "../lib/redis";

/**
 * Redis key patterns:
 *  - refresh:{jti} => userId   (stores a valid refresh token jti)
 *  - bl:{jti} => 1             (blacklisted access token jti)
 *
 * TTLs are set to token expiry so keys auto-expire.
 */



export async function storeRefreshToken(jti: string, userId: string, ttlSeconds: number) {
    // set key with TTL 
    await redis.set(`refresh:${jti}`, userId, "EX", ttlSeconds)
}

export async function revokeRefreshToken(jti: string) {
    await redis.del(`refresh:${jti}`);
}

export async function isRefreshTokenValid(jti: string) {
    const v = await redis.get(`refresh:${jti}`);
    return v !== null;
}


/** Blacklist access token jti for remaining TTL seconds */

export async function blacklistAccessToken(jti: string, ttlSeconds: number) {
    // set a flag; expires after TTL 
    await redis.set(`bl:${jti}`, "1", "EX", ttlSeconds);
}

export async function isAccessTokenBlacklisted(jti: string) {
    const v = await redis.get(`bl:${jti}`);
    return v !== null;
}
