const fs = require("fs");
const path = require("path");
const os = require("os");

const CACHE_TTL = 5 * 60 * 1000;
let commandCache = {
  data: null,
  timestamp: null,
};

const isCacheValid = () => {
  if (!commandCache.data || !commandCache.timestamp) return false;
  return Date.now() - commandCache.timestamp < CACHE_TTL;
};

module.exports = {
  name: "menu",
  category: "info",
  run: async (ctx) => {
    if (isCacheValid()) {
      const { tree, totalCommands } = commandCache.data;
      await sendMenu(ctx, tree, totalCommands);
      return;
    }

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

    commandCache.data = { tree, totalCommands };
    commandCache.timestamp = Date.now();

    await sendMenu(ctx, tree, totalCommands);
  },
};

async function sendMenu(ctx, tree, totalCommands) {
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

  const totalRamGB = (os.totalmem() / 1e9).toFixed(2);
  const usedRamGB = ((os.totalmem() - os.freemem()) / 1e9).toFixed(2);

  const senderName = ctx.msg.pushName || "User";
  const greeting = `Greetings Fellow Homosapian @${senderName}`;

  const readMore = String.fromCharCode(8204).repeat(4000);

  const header = [];
  header.push("╔════════════════════════════════════╗");
  header.push("║          🌴 Primal Ape Menu         ║");
  header.push("╚════════════════════════════════════╝");

  const infoLines = [];
  infoLines.push(`Date: ${date}`);
  infoLines.push(`Time: ${time}`);
  infoLines.push(`RAM: ${usedRamGB} GB / ${totalRamGB} GB`);
  infoLines.push(`Total Commands: ${totalCommands}`);

  const sections = [];
  const categories = Object.keys(tree).sort();
  for (const category of categories) {
    const cmds = tree[category].sort();
    sections.push(`\n🏷️  ${category.toUpperCase()}  —  (${cmds.length})`);
    for (const cmd of cmds) {
      sections.push(`  • ${cmd}`);
    }
  }

  const menuParts = [];
  menuParts.push(...header);
  menuParts.push(...infoLines.map((l) => `  ${l}`));
  menuParts.push("────────────────────────────────────");
  menuParts.push(...sections);

  const finalMenu = `${greeting}\n${readMore}\n${menuParts.join("\n")}`;

  await ctx.reply(finalMenu);
}
