module.exports = {
  name: "qr",
  category: "tools",
  run: async (ctx) => {
    const content = (ctx.text || "").trim();
    if (!content) return ctx.reply("> usage: qr <text|url>");
    try {
      const url = `https://quickchart.io/qr?margin=2&size=512&text=${encodeURIComponent(
        content
      )}`;
      const r = await fetch(url);
      const buf = Buffer.from(await r.arrayBuffer());
      await ctx.send({ image: buf, caption: "> QR code" });
    } catch (e) {
      await ctx.reply("> qr error");
    }
  },
};
