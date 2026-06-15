"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSession = encryptSession;
exports.decryptSession = decryptSession;
const jose_1 = require("jose");
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green");
async function encryptSession(payload) {
    return await new jose_1.SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(SECRET_KEY);
}
async function decryptSession(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, SECRET_KEY, {
            algorithms: ["HS256"],
        });
        return payload;
    }
    catch (error) {
        return null;
    }
}
