module.exports = {
  name: "jwt",
  category: "tools",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !jwt <token>");
    try {
      const parts = ctx.text.split(".");
      if (parts.length < 2) return ctx.reply("> invalid jwt");
      const header = JSON.parse(
        Buffer.from(parts[0], "base64").toString("utf8")
      );
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf8")
      );
      await ctx.reply(
        "> HEADER:\n" +
          JSON.stringify(header, null, 2) +
          "\n\n> PAYLOAD:\n" +
          JSON.stringify(payload, null, 2)
      );
    } catch {
      ctx.reply("> failed to decode jwt");
    }
  },
};
