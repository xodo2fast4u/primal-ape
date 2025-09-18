const fs = require("fs");
const path = require("path");
const { fork } = require("child_process");
const chokidar = require("chokidar");
const P = require("pino");

if (process.env.PRIMAL_APE_MASTER !== "1") {
  let child = null;
  const spawn = () => {
    if (child) child.removeAllListeners();
    child = fork(__filename, [], {
      env: { ...process.env, PRIMAL_APE_MASTER: "1" },
    });
    child.on("exit", (code) => {
      if (code !== 0) setTimeout(spawn, 1000);
    });
  };
  spawn();
  const selfPath = __filename;
  chokidar.watch(selfPath, { ignoreInitial: true }).on("all", () => {
    if (child && child.kill) child.kill("SIGTERM");
    setTimeout(spawn, 300);
  });
  process.on("SIGINT", () => {
    if (child && child.kill) child.kill("SIGTERM");
    process.exit(0);
  });
  return;
}

const {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
} = require("baileys");
const {
  useSqliteAuthStateEnterprise,
} = require("./use-sqlite-file-auth-state");
const readline = require("readline");

const ROOT = process.cwd();
const CMDS_DIR = path.join(ROOT, "commands");
const PING_PATH = path.join(CMDS_DIR, "info", "ping.js");

const ensureScaffold = () => {
  const infoDir = path.dirname(PING_PATH);
  if (!fs.existsSync(infoDir)) fs.mkdirSync(infoDir, { recursive: true });
};

const rlQuestion = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(q, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });

let sock = null;
let restarting = false;
let commandMap = new Map();
let watcher = null;
let socketReady = false;

const STORE_PATH = path.join(ROOT, "store.json");
let messageStore = {};

if (fs.existsSync(STORE_PATH)) {
  try {
    messageStore = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch {
    messageStore = {};
  }
}

const saveStore = () => {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(messageStore, null, 2));
  } catch (e) {
    console.error("❌ Failed to save store:", e.message);
  }
};

const cacheMessage = (msg) => {
  if (!msg?.key?.id || !msg?.key?.remoteJid) return;
  const jid = msg.key.remoteJid;
  if (!messageStore[jid]) messageStore[jid] = {};
  messageStore[jid][msg.key.id] = msg;
  saveStore();
};

const getMessage = (jid, id) => {
  return messageStore[jid]?.[id] || null;
};

global.__messageStore = { cacheMessage, getMessage };

const loadCommands = () => {
  const files = [];
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.isFile() && f.name.endsWith(".js")) files.push(p);
    }
  };
  if (fs.existsSync(CMDS_DIR)) walk(CMDS_DIR);
  const tempMap = new Map();
  for (const file of files) {
    try {
      delete require.cache[require.resolve(file)];
      const mod = require(file);
      const cmd = mod.default || mod;
      const name = (cmd.name || path.basename(file, ".js")).toLowerCase();
      if (typeof cmd.run === "function") {
        tempMap.set(name, { run: cmd.run, path: file });
      }
    } catch {}
  }
  commandMap = tempMap;
};

const watchCommands = () => {
  if (watcher) watcher.close();
  watcher = chokidar.watch(CMDS_DIR, { ignoreInitial: true, depth: 10 });
  watcher.on("add", loadCommands);
  watcher.on("change", loadCommands);
  watcher.on("unlink", loadCommands);
};

const parseText = (msg) => {
  const m = msg.message || {};
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage && m.extendedTextMessage.text)
    return m.extendedTextMessage.text;
  if (m.imageMessage && m.imageMessage.caption) return m.imageMessage.caption;
  if (m.videoMessage && m.videoMessage.caption) return m.videoMessage.caption;
  return "";
};

const reply = async (jid, text, quoted) => {
  if (!socketReady) {
    console.warn("⚠️ Socket not ready, dropping reply");
    return;
  }
  try {
    await sock.sendMessage(jid, { text }, { quoted });
  } catch (e) {
    console.error("❌ Failed to send reply:", e.message);
  }
};

const handleMessage = async (msg) => {
  try {
    const jid = msg.key.remoteJid;
    if (!jid) return;
    if (msg.key.fromMe) return;

    const body = parseText(msg).trim();
    if (!body.startsWith("!")) return;

    const [cmdNameRaw, ...rest] = body.slice(1).split(/\s+/);
    const cmdName = (cmdNameRaw || "").toLowerCase();
    const cmd = commandMap.get(cmdName);
    if (!cmd) return;

    const { getMode } = require("./lib/mode");
    const mode = getMode();

    const isGroup = jid.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const botId = sock.user?.id;

    if (mode === "private" && isGroup) return;
    if (mode === "self" && sender !== botId) return;

    if (isGroup && (mode === "admin" || mode === "nonadmin")) {
      const metadata = await sock.groupMetadata(jid);
      const role = metadata.participants.find((p) => p.id === sender)?.admin;
      const isAdmin = role === "admin" || role === "superadmin";

      if (mode === "admin" && !isAdmin) return;
      if (mode === "nonadmin" && isAdmin) return;
    }

    try {
      const eco = require("./lib/economy");
      const res = eco.addXpForCommand(jid);
      if (res.leveledUp) {
        reply(
          jid,
          `level up! now L${res.level} • ${res.title}\nbonus: ${
            eco.CURRENCY_EMOJI
          } ${res.rewards.reduce((a, r) => a + (r.bits || 0), 0)} ${
            eco.CURRENCY_NAME
          }`,
          msg
        );
      }
    } catch {}

    const mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ? {
          sender: msg.message.extendedTextMessage.contextInfo.participant,
          message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
        }
      : null;

    const ctx = {
      sock,
      msg,
      jid,
      sender,
      isGroup,
      mentionedJid,
      quoted,
      args: rest,
      text: rest.join(" "),
      reply: (t) => reply(jid, t, msg),
      send: async (content, options = {}) => {
        if (!socketReady) {
          console.warn("⚠️ socket not ready, dropping send");
          return;
        }
        try {
          await sock.sendMessage(jid, content, { quoted: msg, ...options });
        } catch (e) {
          console.error("❌ failed to send message:", e.message);
        }
      },
    };

    await cmd.run(ctx);
  } catch (e) {
    console.error("❌ handleMessage crashed:", e.message);
  }
};

const logger = P({ level: "silent" });

const startSocket = async () => {
  if (restarting) return;
  restarting = true;
  try {
    const { state, saveCreds } = await useSqliteAuthStateEnterprise(
      path.join(ROOT, "auth.db")
    );
    const { version } = await fetchLatestBaileysVersion();
    sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.macOS("Safari"),
      markOnlineOnConnect: true,
      connectTimeoutMs: 45_000,
      syncFullHistory: false,
      logger,
    });

    if (!state.creds.registered) {
      const pn = await rlQuestion(
        "Enter your phone number with country code: "
      );
      const custom = await rlQuestion(
        "Optional custom 8-char pairing code (press Enter to skip): "
      );
      await sock.requestPairingCode(
        pn,
        custom && custom.length > 0 ? custom : undefined
      );
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
      for (const m of messages) {
        cacheMessage(m);
        handleMessage(m);
      }
    });

    // 🔹 Deleted message recovery hook
    // sock.ev.on("messages.update", async (updates) => {
    //   const recoverCmd = commandMap.get("recover");
    //   if (!recoverCmd) return;
    //   for (const update of updates) {
    //     await recoverCmd.run({
    //       sock,
    //       update,
    //       reply: (t, quoted) => reply(update.key?.remoteJid, t, quoted),
    //     });
    //   }
    // });

    sock.ev.on("connection.update", (u) => {
      const { connection, lastDisconnect } = u;
      if (connection === "open") {
        socketReady = true;
        console.log("✅ WhatsApp connected");
      } else if (connection === "close") {
        socketReady = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          setTimeout(() => startSocket(), 1500);
        } else {
          process.exit(0);
        }
      }
    });

    restarting = false;
    process.send && process.send("ready");
  } catch {
    restarting = false;
    setTimeout(() => startSocket(), 2000);
  }
};

const boot = async () => {
  ensureScaffold();
  loadCommands();
  watchCommands();
  await startSocket();
};

boot();
