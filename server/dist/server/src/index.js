"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socketManager_1 = require("./socket/socketManager");
const findMatch_1 = require("./games/findMatch");
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
exports.io = io;
// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── Run Find Match validation on startup ──────────────────────────────────
const validation = (0, findMatch_1.validateFindMatchGeneration)(10000);
if (validation.passed) {
    console.log('✅ Find Match generation: 10,000 rounds validated — exactly 1 common symbol each.');
}
else {
    console.error('❌ Find Match validation FAILED:');
    validation.errors.slice(0, 5).forEach(e => console.error('  ', e));
}
// ─── Register socket handlers ──────────────────────────────────────────────
(0, socketManager_1.registerSocketHandlers)(io);
httpServer.listen(PORT, () => {
    console.log(`🚀 DUELZONE server running on port ${PORT}`);
    console.log(`   CORS allowed: ${CLIENT_URL}`);
});
