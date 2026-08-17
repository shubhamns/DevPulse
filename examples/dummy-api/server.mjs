import { createServer } from "node:http";
import { DevPulse } from "@devpulse/sdk";

const PORT = Number(process.env.PORT ?? 5050);
const API_KEY = process.env.DEVPULSE_API_KEY;
const ENDPOINT = process.env.DEVPULSE_ENDPOINT ?? "http://localhost:4000/api/v1/events";
const ENVIRONMENT = process.env.DEVPULSE_ENVIRONMENT ?? "development";

if (!API_KEY) {
  console.error("Missing DEVPULSE_API_KEY. Copy .env.example to .env and set your dp_live_ key.");
  process.exit(1);
}

DevPulse.init({
  apiKey: API_KEY,
  environment: ENVIRONMENT,
  release: "dummy-api@1.0.0",
  endpoint: ENDPOINT,
});

DevPulse.setContext({ service: "dummy-api", runtime: "node" });

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(`${JSON.stringify(body)}\n`);
}

function handleRoute(pathname, res) {
  if (pathname === "/health") {
    sendJson(res, 200, { status: "ok", service: "dummy-api" });
    return;
  }

  if (pathname === "/error/type") {
    DevPulse.setUser({ id: "demo-user-1", email: "demo@example.com" });
    DevPulse.setContext({ route: "/error/type", feature: "checkout" });

    const error = new TypeError("Cannot read properties of undefined (reading 'price')");
    DevPulse.captureException(error);

    sendJson(res, 500, {
      error: "TypeError",
      message: error.message,
      sentToDevPulse: true,
    });
    return;
  }

  if (pathname === "/error/payment") {
    DevPulse.setUser({ id: "demo-user-2" });
    DevPulse.setContext({ route: "/error/payment", orderId: "ord_98765" });

    const error = new Error("Payment gateway timeout after 30s");
    error.name = "PaymentError";
    DevPulse.captureException(error);

    sendJson(res, 502, {
      error: "PaymentError",
      message: error.message,
      sentToDevPulse: true,
    });
    return;
  }

  if (pathname === "/error/reference") {
    DevPulse.setContext({ route: "/error/reference", module: "inventory" });

    const error = new ReferenceError("inventoryCount is not defined");
    DevPulse.captureException(error);

    sendJson(res, 500, {
      error: "ReferenceError",
      message: error.message,
      sentToDevPulse: true,
    });
    return;
  }

  sendJson(res, 404, {
    error: "NOT_FOUND",
    message: "Try /health, /error/type, /error/payment, or /error/reference",
  });
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  handleRoute(url.pathname, res);
});

server.listen(PORT, () => {
  console.log(`Dummy API listening on http://localhost:${PORT}`);
  console.log(`DevPulse endpoint: ${ENDPOINT}`);
  console.log("Test routes:");
  console.log(`  curl http://localhost:${PORT}/error/type`);
  console.log(`  curl http://localhost:${PORT}/error/payment`);
  console.log(`  curl http://localhost:${PORT}/error/reference`);
});
