module.exports = {
  name: "decode",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !decode <base64>");
    try {
      const out = Buffer.from(ctx.text, "base64").toString("utf8");
      await ctx.reply("> " + out);
    } catch {
      ctx.reply("> invalid base64");
    }
  },
};
