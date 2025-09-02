const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  name: "menu",
  category: "info",
  run: async (ctx) => {
    const root = path.join(__dirname, "..", "..", "commands");
    const tree = {};
    let totalCommands = 0;

    const scan = (dir, parentCategory = "") => {
      const entries = fs.existsSync(dir)
        ? fs.readdirSync(dir, { withFileTypes: true })
        : [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const newCategory = entry.name.toLowerCase();
          scan(fullPath, newCategory);
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
          try {
            delete require.cache[require.resolve(fullPath)];
            const mod = require(fullPath);
            const name = mod.name || path.basename(fullPath, ".js");
            const category =
              parentCategory || (mod.category || "misc").toLowerCase();

            if (!tree[category]) tree[category] = [];
            tree[category].push(name);
            totalCommands++;
          } catch (err) {
            console.error(`Failed to load ${fullPath}:`, err);
          }
        }
      }
    };

    scan(root);

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
      "PRIMEAL-APE COMMAND MENU",
      "╭─ SYSTEM STATUS",
      `│  Date: ${date}`,
      `│  Time: ${time}`,
      `│  RAM: ${usedRamGiB}GiB / ${totalRamGiB}GiB`,
      `│  Version: ${version}`,
      `│  Total Commands: ${totalCommands}`,
      "╰───────────────────────",
    ];

    for (const category of Object.keys(tree).sort()) {
      lines.push(`\n╭─ ${category.toUpperCase()}`);
      for (const cmd of tree[category].sort()) {
        lines.push(`│  • ${cmd}`);
      }
      lines.push("╰───────────────────────");
    }

    await ctx.reply(lines.join("\n"));
  },
};
