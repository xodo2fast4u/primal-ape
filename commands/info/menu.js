const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  name: "menu",
  category: "info",
  run: async (ctx) => {
    const root = path.join(__dirname, "..", "..");
    const tree = {};

    const scan = (dir) => {
      const entries = fs.existsSync(dir)
        ? fs.readdirSync(dir, { withFileTypes: true })
        : [];
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) scan(full);
        else if (e.isFile() && e.name.endsWith(".js")) {
          try {
            delete require.cache[require.resolve(full)];
            const mod = require(full);
            const cat = (mod.category || "misc").toLowerCase();
            const name = mod.name || path.basename(full, ".js");
            if (!tree[cat]) tree[cat] = [];
            tree[cat].push(name);
          } catch {}
        }
      }
    };

    scan(path.join(root, "commands"));

    const now = new Date();
    const date = now.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const time = now.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalRamGiB = (os.totalmem() / 1024 ** 3).toFixed(1);
    const usedRamGiB = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(1);
    const version = "1.0.0";

    const lines = [
      "‎".repeat(500),
      " PRIMEAL-APE COMMANDS",
      "╭─⧉ SYSTEM INFO",
      `│   Date: ${date}`,
      `│   Time: ${time}`,
      `│   RAM: ${usedRamGiB}GiB / ${totalRamGiB}GiB`,
      `│   Version: ${version}`,
      "│",
      "╰─⧉ COMMANDS ↓↓↓",
    ];

    for (const cat of Object.keys(tree).sort()) {
      lines.push(`╭─ ${cat.toUpperCase()}`);
      for (const cmd of tree[cat].sort()) {
        lines.push(`│  └ ${cmd}`);
      }
      lines.push("╰──────────────");
    }

    await ctx.reply(lines.join("\n"));
  },
};
