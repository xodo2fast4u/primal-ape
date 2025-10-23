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
        "Bot Name": "Primal Ape",
        Version: pkg.version,
        Description: pkg.description,
        Author: pkg.author || "Unknown",
        "Open Source": pkg.openSource !== false ? "Yes" : "No",
        "Node.js": process.version,
        Platform: process.platform,
      };

      let output = `> Primal Ape Information\n` + `> =================\n`;

      for (const [key, value] of Object.entries(info)) {
        output += `> ${key}: ${value}\n`;
      }

      output += `> Dependencies:\n`;
      for (const [lib, ver] of Object.entries(pkg.dependencies || {})) {
        output += `>   ${lib}: ${ver}\n`;
      }

      await ctx.reply(output.trim());
    } catch (err) {
      await ctx.reply(
        "> Failed to read package.json. Check file path and permissions."
      );
    }
  },
};
