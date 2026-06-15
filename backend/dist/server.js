"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const prisma_1 = require("./lib/prisma");
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    optionsSuccessStatus: 200
};
// Configure CORS to support cookie credentials from frontend
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions)); // Handle preflight checks globally
// Global parsing middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health Check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
});
// Mount all API routes on /api
app.use("/api", api_1.default);
// Database check and server launch
prisma_1.prisma
    .$connect()
    .then(() => {
    console.log("PostgreSQL database connected successfully via Prisma.");
    app.listen(PORT, () => {
        console.log(`Server is running in dev mode on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.error("Critical: Database connection failed on startup!", err);
    process.exit(1);
});
