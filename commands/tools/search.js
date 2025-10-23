module.exports = {
  name: "search",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("Usage: !search <query>");
      return;
    }

    const wRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        q
      )}`
    ).catch(() => null);

    const wJson = await (wRes ? wRes.json().catch(() => null) : null);

    if (!wJson?.title || !wJson?.extract) {
      await ctx.reply("No results found.");
      return;
    }

    let caption = `📖 ${wJson.title}\n> ${wJson.extract}`;

    let imageBuffer = null;
    if (wJson.thumbnail?.source) {
      const iRes = await fetch(wJson.thumbnail.source).catch(() => null);
      const iBuf = await (iRes ? iRes.arrayBuffer().catch(() => null) : null);
      if (iBuf) imageBuffer = Buffer.from(iBuf);
    }

    if (imageBuffer) {
      await ctx.send({ image: imageBuffer, caption });
    } else {
      await ctx.reply(caption);
    }
  },
};
