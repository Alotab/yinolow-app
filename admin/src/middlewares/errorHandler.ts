import { Request, Response, NextFunction } from "express";
const logger = require("../utils/logger");


export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.warn("Unhandled error:", err.stack);

    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });

}

// module.exports = errorHandler;