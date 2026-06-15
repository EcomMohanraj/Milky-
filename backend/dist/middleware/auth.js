"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const session_1 = require("../lib/session");
async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.milky_session;
        if (!token) {
            return res.status(401).json({ success: false, error: "Unauthorized: No session token provided" });
        }
        const session = await (0, session_1.decryptSession)(token);
        if (!session) {
            return res.status(401).json({ success: false, error: "Unauthorized: Invalid session token" });
        }
        req.user = session;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ success: false, error: "Unauthorized" });
    }
}
function adminMiddleware(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ success: false, error: "Forbidden: Admin access required" });
    }
    next();
}
