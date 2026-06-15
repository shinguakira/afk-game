import express from "express";
import cors from "cors";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data");
// Dedicated var (not generic PORT) so a dev/preview launcher that injects PORT
// for the client can't accidentally move the save-server off the proxied port.
const PORT = Number(process.env.SAVE_PORT ?? 3001);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

/** Only allow simple slot names so a save id can never escape DATA_DIR. */
function safeSlot(raw: string): string | null {
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(raw)) return null;
  return raw;
}

function slotPath(slot: string): string {
  return path.join(DATA_DIR, `${slot}.json`);
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Load a save slot. 404 (with exists:false) when there is no save yet.
app.get("/api/save/:slot", async (req, res) => {
  const slot = safeSlot(req.params.slot);
  if (!slot) return res.status(400).json({ error: "bad slot name" });
  try {
    const raw = await fs.readFile(slotPath(slot), "utf8");
    res.type("application/json").send(raw);
  } catch (err: any) {
    if (err?.code === "ENOENT") return res.status(404).json({ exists: false });
    console.error("load error", err);
    res.status(500).json({ error: "failed to read save" });
  }
});

// Write a save slot. Body is the full game state JSON.
app.post("/api/save/:slot", async (req, res) => {
  const slot = safeSlot(req.params.slot);
  if (!slot) return res.status(400).json({ error: "bad slot name" });
  if (req.body == null || typeof req.body !== "object") {
    return res.status(400).json({ error: "body must be a JSON object" });
  }
  try {
    await ensureDataDir();
    // Write to a temp file then rename, so an interrupted write can't corrupt a save.
    const tmp = slotPath(slot) + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(req.body), "utf8");
    await fs.rename(tmp, slotPath(slot));
    res.json({ ok: true, savedAt: Date.now() });
  } catch (err) {
    console.error("save error", err);
    res.status(500).json({ error: "failed to write save" });
  }
});

// Delete a save slot (used by "reset / hard wipe" in the client).
app.delete("/api/save/:slot", async (req, res) => {
  const slot = safeSlot(req.params.slot);
  if (!slot) return res.status(400).json({ error: "bad slot name" });
  try {
    await fs.unlink(slotPath(slot));
    res.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "ENOENT") return res.json({ ok: true });
    console.error("delete error", err);
    res.status(500).json({ error: "failed to delete save" });
  }
});

ensureDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`[save-server] listening on http://localhost:${PORT}`);
    console.log(`[save-server] saves stored in ${DATA_DIR}`);
  });
});
