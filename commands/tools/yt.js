module.exports = {
  name: "yt",
  run: async (ctx) => {
    if (!ctx.text) return ctx.reply("> usage: !yt <query>");
    try {
      const res = await fetch(
        `https://piped.video/api/v1/search?q=${encodeURIComponent(ctx.text)}`
      );
      const data = await res.json();
      if (!data || !data.length) return ctx.reply("> no results found");
      const v = data[0];
      await ctx.reply(
        `> 🎬 ${v.title}\n` +
          `> 📺 ${v.uploaderName}\n` +
          `> ⏱️ ${v.duration}\n` +
          `> 🔗 https://youtube.com/watch?v=${v.url.split("/").pop()}`
      );
    } catch {
      ctx.reply("> failed to fetch");
    }
  },
};
