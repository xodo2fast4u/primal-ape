module.exports = {
  name: "headers",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !headers <url>");
    try {
      const res = await fetch(ctx.text, { method: "HEAD" });
      let out = "";
      for (const [k, v] of res.headers) {
        out += `> ${k}: ${v}\n`;
      }
      await ctx.reply(out || "> no headers");
    } catch {
      ctx.reply("> failed to fetch headers");
    }
  },
};
