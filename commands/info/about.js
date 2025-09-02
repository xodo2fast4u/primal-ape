const fs = require("fs");
const path = require("path");

module.exports = {
  name: "about",
  category: "info",
  run: async (ctx) => {
    try {
      const pkgPath = path.join(__dirname, "..", "..", "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      const info = {
        botName: "Primal Ape",
        version: pkg.version,
        description: pkg.description || "A modular and elegant WhatsApp bot.",
        author: pkg.author || "Unknown",
        openSource: true,
        node: process.version,
        platform: process.platform,
        dependencies: pkg.dependencies || {},
      };

      let output =
        `> Bot Info\n` +
        `> ==========\n` +
        `> name: ${info.botName}\n` +
        `> version: ${info.version}\n` +
        `> description: ${info.description}\n` +
        `> author: ${info.author}\n` +
        `> open source: ${info.openSource ? "yes" : "no"}\n` +
        `> node: ${info.node}\n` +
        `> platform: ${info.platform}\n` +
        `> dependencies:\n`;

      for (const [lib, ver] of Object.entries(info.dependencies)) {
        output += `>   ${lib}: ${ver}\n`;
      }

      await ctx.reply(output.trim());
    } catch (err) {
      await ctx.reply("> Failed to read package.json.");
    }
  },
};
