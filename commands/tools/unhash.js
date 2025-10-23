module.exports = {
  name: "unhash",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !unhash <hash>");
    try {
      const res = await fetch(`https://api.hashlookup.app/hash/${ctx.text}`);
      if (!res.ok) return ctx.reply("> not found");
      const data = await res.json();
      if (!data.plaintext) return ctx.reply("> no match found");
      await ctx.reply("> 🔓 " + data.plaintext);
    } catch {
      ctx.reply("> failed to lookup");
    }
  },
};
