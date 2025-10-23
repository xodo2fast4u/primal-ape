module.exports = {
  name: "screenshot",
  category: "tools",
  run: async (ctx) => {
    let u = (ctx.text || "").trim();
    if (!u) return ctx.reply("> usage: screenshot <url>");
    if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
    try {
      const shot = `https://image.thum.io/get/width/1200/crop/900/noanimate/${u}`;
      const r = await fetch(shot);
      const buf = Buffer.from(await r.arrayBuffer());
      await ctx.send({ image: buf, caption: `🖼️ ${u}` });
    } catch (e) {
      await ctx.reply("> screenshot error");
    }
  },
};
