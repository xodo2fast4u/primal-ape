// prime.js
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const pino = require("pino");
const baileys = require("baileys");
const makeWASocket = baileys.default;
const { useMultiFileAuthState } = baileys;
const chokidar = require("chokidar");

const watchCommands = () => {
  const watcher = chokidar.watch(COMMANDS_DIR, {
    persistent: true,
    ignoreInitial: true,
    depth: Infinity,
    awaitWriteFinish: true,
  });

  watcher.on("add", reloadCommand);
  watcher.on("change", reloadCommand);
  watcher.on("unlink", removeCommand);
};

const reloadCommand = (filePath) => {
  try {
    delete require.cache[require.resolve(filePath)];
    const mod = require(filePath);
    if (mod && mod.name && typeof mod.run === "function") {
      commands.set(mod.name.toLowerCase(), mod);
      console.log(`Reloaded command: ${mod.name}`);
    }
  } catch (err) {
    console.error(`Failed to reload ${filePath}:`, err.message);
  }
};

const removeCommand = (filePath) => {
  try {
    const mod = require(filePath);
    if (mod && mod.name) {
      commands.delete(mod.name.toLowerCase());
      console.log(`Removed command: ${mod.name}`);
    }
    delete require.cache[require.resolve(filePath)];
  } catch (err) {
    console.error(`Failed to remove ${filePath}:`, err.message);
  }
};

const COMMANDS_DIR = path.join(__dirname, "commands");
const PREFIXES = ["!", "."];
let commands = new Map();
let sock;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (q) =>
  new Promise((res) => rl.question(q, (ans) => res(ans.trim())));

const loadFilesRecursive = (dir) => {
  const entries = fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true })
    : [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) loadFilesRecursive(full);
    else if (e.isFile() && e.name.endsWith(".js")) {
      delete require.cache[require.resolve(full)];
      const mod = require(full);
      if (mod && mod.name && typeof mod.run === "function") {
        commands.set(mod.name.toLowerCase(), mod);
      }
    }
  }
};

const getText = (m) => {
  const msg = m.message || {};
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.buttonsResponseMessage?.selectedDisplayText)
    return msg.buttonsResponseMessage.selectedDisplayText;
  if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
    return msg.listResponseMessage.singleSelectReply.selectedRowId;
  return "";
};

const parseCommand = (body) => {
  const b = body.trim();
  for (const p of PREFIXES) {
    if (b.startsWith(p)) {
      const parts = b.slice(p.length).trim().split(/\s+/);
      return { cmd: (parts.shift() || "").toLowerCase(), args: parts };
    }
  }
  const parts = b.split(/\s+/);
  return { cmd: (parts[0] || "").toLowerCase(), args: parts.slice(1) };
};

const reply = async (jid, text, quoted) => {
  await sock.sendMessage(jid, { text }, { quoted });
};

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "info" }),
  });

  loadFilesRecursive(COMMANDS_DIR);
  watchCommands();

  if (!sock.authState.creds.registered) {
    const phoneNumber = await question("Enter your WhatsApp phone number:\n");
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`Pairing Code: ${code?.match(/.{1,4}/g)?.join("-") || code}`);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") console.log("Connected successfully");
    if (connection === "close") {
      const shouldReconnect = !(
        lastDisconnect?.error?.output?.statusCode === 401 ||
        lastDisconnect?.error?.message?.toLowerCase()?.includes("logged out")
      );
      if (shouldReconnect) setTimeout(start, 2000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      const from = m.key.remoteJid;
      const body = getText(m);
      if (!body) continue;
      const { cmd, args } = parseCommand(body);
      const name = cmd || "";
      const picked = commands.get(name);
      if (picked) {
        const ctx = {
          sock,
          m,
          from,
          body,
          args,
          reply: (text, options = {}) =>
            sock.sendMessage(from, { text, ...options }, { quoted: m }),
        };
        try {
          await picked.run(ctx);
        } catch {}
        continue;
      }
      if (name === "ping") {
        await reply(from, "pong", m);
      }
    }
  });

  process.on("uncaughtException", () => {});
  process.on("unhandledRejection", () => {});
};

start();
