module.exports = {
  name: "http",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !http <url>");
    try {
      const res = await fetch(ctx.text, { method: "GET" });
      const text = await res.text();
      await ctx.reply("```" + text.slice(0, 500) + "..." + "```");
    } catch {
      ctx.reply("> failed to fetch");
    }
  },
};
