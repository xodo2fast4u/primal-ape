module.exports = {
  name: "anime",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("Usage: !anime <title>");
      return;
    }

    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
        q
      )}&order_by=popularity&sort=asc&sfw=true&limit=10`
    ).catch(() => null);

    const data = await (res ? res.json().catch(() => null) : null);
    let item = null;

    if (data?.data?.length) {
      item =
        data.data.find(
          (a) =>
            a.title?.toLowerCase() === q.toLowerCase() ||
            a.title_english?.toLowerCase() === q.toLowerCase()
        ) || data.data[0];
    }

    if (!item) {
      await ctx.reply("> No anime found.");
      return;
    }

    const imgUrl =
      item.images?.jpg?.large_image_url ||
      item.images?.jpg?.image_url ||
      item.images?.webp?.large_image_url ||
      item.images?.webp?.image_url;

    let caption = "";
    const tEn = item.title_english || "";
    const tJp = item.title || "";
    const titles = [tEn, tJp]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(" | ");

    const genres = (item.genres || []).map((g) => g.name).join(", ");
    const themes = (item.themes || []).map((g) => g.name).join(", ");
    const demos = (item.demographics || []).map((g) => g.name).join(", ");
    const studios = (item.studios || []).map((s) => s.name).join(", ");
    const producers = (item.producers || []).map((s) => s.name).join(", ");

    const year = item.year || item.aired?.prop?.from?.year || "";
    const score = item.score != null ? `${item.score}` : "";
    const rank = item.rank != null ? `#${item.rank}` : "";
    const pop = item.popularity != null ? `#${item.popularity}` : "";
    const favorites = item.favorites != null ? `${item.favorites}` : "";
    const synopsis = (item.synopsis || "").trim().slice(0, 1500);

    caption += `> Title: ${titles}\n`;
    caption += `> Type: ${item.type || ""}\n`;
    caption += `> Episodes: ${item.episodes != null ? item.episodes : ""}\n`;
    caption += `> Duration: ${item.duration || ""}\n`;
    caption += `> Status: ${item.status || ""}\n`;
    caption += `> Aired: ${year || ""}\n`;
    caption += `> Score: ${score} Rank: ${rank} Popularity: ${pop} Favorites: ${favorites}\n`;
    caption += `> Studios: ${studios}\n`;
    caption += `> Producers: ${producers}\n`;
    caption += `> Genres: ${genres}\n`;
    caption += `> Themes: ${themes}\n`;
    caption += `> Demographics: ${demos}\n`;
    caption += `> Synopsis: ${synopsis}`;

    let imageBuffer = null;
    if (imgUrl) {
      const iRes = await fetch(imgUrl).catch(() => null);
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
