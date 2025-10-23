module.exports = {
  name: "shorten",
  category: "tools",
  run: async (ctx) => {
    const u = (ctx.text || "").trim();
    if (!u) return ctx.reply("> usage: shorten <url>");
    try {
      const res = await fetch(
        `https://is.gd/create.php?format=simple&url=${encodeURIComponent(u)}`
      );
      const short = await res.text();
      if (!short || short.includes("Error"))
        return ctx.reply("> could not shorten");
      await ctx.reply(`> ${short}`);
    } catch (e) {
      await ctx.reply("> shorten error");
    }
  },
};
