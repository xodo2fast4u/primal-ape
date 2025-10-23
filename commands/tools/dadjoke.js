module.exports = {
  name: "dadjoke",
  category: "tools",
  run: async (ctx) => {
    try {
      const res = await fetch("https://icanhazdadjoke.com/", {
        headers: { Accept: "text/plain" },
      });
      const text = await res.text();
      await ctx.reply(text.trim());
    } catch (e) {
      await ctx.reply("> dadjoke error");
    }
  },
};
