module.exports = {
  name: "encode",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !encode <text>");
    const out = Buffer.from(ctx.text, "utf8").toString("base64");
    await ctx.reply("> " + out);
  },
};
