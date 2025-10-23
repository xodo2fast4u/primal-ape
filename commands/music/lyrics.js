module.exports = {
  name: "lyrics",
  category: "music",
  run: async (ctx) => {
    const query = (ctx.text || "").trim();
    if (!query) {
      await ctx.reply("> usage: lyrics <song title or artist>");
      return;
    }

    try {
      const res = await fetch(
        `https://lyrist.vercel.app/api/${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        await ctx.reply("> failed to fetch lyrics");
        return;
      }

      const data = await res.json();
      if (!data || !data.lyrics) {
        await ctx.reply("> lyrics not found");
        return;
      }

      const title = data.title || query;
      const artist = data.artist || "";
      const header = artist ? `🎶 ${title} — ${artist}` : `🎶 ${title}`;
      const lyrics = String(data.lyrics).replace(/\r/g, "");

      const limit = 3500;
      const trimmed =
        lyrics.length > limit ? `${lyrics.slice(0, limit)}…` : lyrics;

      await ctx.reply(`${header}\n\n${trimmed}`);
    } catch (err) {
      await ctx.reply("> error retrieving lyrics");
    }
  },
};
