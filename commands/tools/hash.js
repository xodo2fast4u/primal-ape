const crypto = require("crypto");

module.exports = {
  name: "hash",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !hash <text>");

    const md5 = crypto.createHash("md5").update(ctx.text).digest("hex");
    const sha1 = crypto.createHash("sha1").update(ctx.text).digest("hex");
    const sha256 = crypto.createHash("sha256").update(ctx.text).digest("hex");

    const combo = md5 + sha1 + sha256;
    const finalHash = crypto.createHash("sha512").update(combo).digest("hex");

    await ctx.reply(`> ${finalHash}`);
  },
};
