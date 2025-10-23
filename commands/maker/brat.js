module.exports = {
  name: "bart",
  category: "maker",
  run: async (ctx) => {
    try {
      const text = ctx.args.length ? ctx.args.join(" ") : null;
      if (!text) {
        return ctx.reply("❌ Usage: !bart <text>");
      }

      const apiUrl = `https://brat-generator-3sjs.onrender.com/api/brat?text=${encodeURIComponent(
        text
      )}`;

      const res = await fetch(apiUrl);
      if (!res.ok) {
        return ctx.reply("⚠️ API error, try again later.");
      }

      const buffer = Buffer.from(await res.arrayBuffer());

      await ctx.send({
        sticker: buffer,
      });
    } catch (err) {
      console.error("bart error:", err);
      await ctx.reply("⚠️ Failed to generate sticker.");
    }
  },
};
