import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());

// In-memory store ONLY for logic testing
// ⚠️ Use DB in production
const pastes = new Map();

/**
 * Utility: get current time (supports TEST_MODE)
 */
function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    const header = req.headers["x-test-now-ms"];
    if (header) {
      return new Date(Number(header));
    }
  }
  return new Date();
}

/**
 * Health check
 */
app.get("/api/healthz", (req, res) => {
  res.status(200).json({ ok: true });
});

/**
 * Create paste
 */
app.post("/api/pastes", (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = uuidv4();
  const now = new Date();

  pastes.set(id, {
    id,
    content,
    createdAt: now,
    expiresAt: ttl_seconds ? new Date(now.getTime() + ttl_seconds * 1000) : null,
    maxViews: max_views ?? null,
    viewCount: 0
  });

  res.status(201).json({
    id,
    url: `${req.protocol}://${req.get("host")}/p/${id}`
  });
});

/**
 * Fetch paste (API)
 */
app.get("/api/pastes/:id", (req, res) => {
  const paste = pastes.get(req.params.id);
  if (!paste) return res.status(404).json({ error: "Not found" });

  const now = getNow(req);

  if (paste.expiresAt && now > paste.expiresAt) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  paste.viewCount += 1;

  res.json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null ? null : Math.max(paste.maxViews - paste.viewCount, 0),
    expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
  });
});

/**
 * View paste (HTML)
 */
app.get("/p/:id", (req, res) => {
  const paste = pastes.get(req.params.id);
  if (!paste) return res.status(404).send("Not Found");

  const now = getNow(req);

  if (paste.expiresAt && now > paste.expiresAt) {
    return res.status(404).send("Expired");
  }

  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    return res.status(404).send("View limit exceeded");
  }

  paste.viewCount += 1;

  // Safe rendering (no script execution)
  const escaped = paste.content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  res.send(`
    <html>
      <body>
        <pre>${escaped}</pre>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
