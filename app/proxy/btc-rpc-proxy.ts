import express from "express";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3003;

const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || "http://142.93.46.134:3002";
const AUTH_TOKEN = process.env.BTC_RPC_AUTH_TOKEN;
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(",") : [];

if (!AUTH_TOKEN) {
	console.error("BTC_RPC_AUTH_TOKEN environment variable is required");
	process.exit(1);
}

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10000,
	message: "Too many requests from this IP",
	standardHeaders: true,
	legacyHeaders: false,
});

const ipAllowlist = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	if (ALLOWED_IPS.length > 0) {
		const clientIP = req.ip || req.socket.remoteAddress || "unknown";
		if (!ALLOWED_IPS.includes(clientIP)) {
			return res.status(403).json({ error: "IP not allowed" });
		}
	}
	next();
};

const authenticateToken = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	if (token !== AUTH_TOKEN) {
		return res.status(403).json({ error: "Invalid token" });
	}

	next();
};

const validateRequest = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	const allowedPaths = [
		/^\/address\/[a-zA-Z0-9]+\/utxo$/,
		/^\/tx\/[a-fA-F0-9]+$/,
		/^\/tx\/[a-fA-F0-9]+\/hex$/,
	];

	const isAllowed = allowedPaths.some((pattern) => pattern.test(req.path));

	if (!isAllowed) {
		return res.status(404).json({ error: "Endpoint not allowed" });
	}

	next();
};

app.use(express.json());
app.set("trust proxy", 1);
app.use(limiter);

app.get("/health", (req: express.Request, res: express.Response) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(ipAllowlist);
app.use(authenticateToken);
app.use(validateRequest);

app.use(
	"/",
	createProxyMiddleware({
		target: BITCOIN_RPC_URL,
		changeOrigin: true,
		timeout: 30000,
		onError: (err, req, res) => {
			console.error("Proxy error:", err.message);
			if (res && !res.headersSent) {
				res.status(500).json({ error: "Bitcoin RPC unavailable" });
			}
		},
		onProxyReq: (proxyReq, req) => {
			console.log(`Proxying: ${req.method} ${req.path}`);
		},
	}),
);

app.listen(PORT, () => {
	console.log(`Bitcoin RPC Protection Proxy running on port ${PORT}`);
	console.log(`Proxying to: ${BITCOIN_RPC_URL}`);
	console.log(`Auth token configured: ${AUTH_TOKEN ? "Yes" : "No"}`);
	console.log(`IP allowlist: ${ALLOWED_IPS.length > 0 ? ALLOWED_IPS.join(", ") : "Disabled"}`);
});
