module.exports = {
  name: "manga",
  category: "tools",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("> Usage: !manga <title>");
      return;
    }

    const res = await fetch(
      `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(
        q
      )}&order_by=popularity&sort=desc&limit=1`
    ).catch(() => null);
    const data = await (res ? res.json().catch(() => null) : null);
    const item = data?.data?.[0];

    if (!item) {
      await ctx.reply("> No manga found.");
      return;
    }

    const imgUrl =
      item.images?.jpg?.large_image_url ||
      item.images?.jpg?.image_url ||
      item.images?.webp?.large_image_url ||
      item.images?.webp?.image_url;

    const titles = [item.title_english, item.title]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(" | ");

    const genres = (item.genres || []).map((g) => g.name).join(", ");
    const themes = (item.themes || []).map((g) => g.name).join(", ");
    const demos = (item.demographics || []).map((g) => g.name).join(", ");
    const authors = (item.authors || []).map((a) => a.name).join(", ");
    const serializations = (item.serializations || [])
      .map((s) => s.name)
      .join(", ");
    const score = item.score != null ? `${item.score}` : "N/A";
    const rank = item.rank != null ? `#${item.rank}` : "N/A";
    const pop = item.popularity != null ? `#${item.popularity}` : "N/A";
    const favorites = item.favorites != null ? `${item.favorites}` : "N/A";
    const synopsis = (item.synopsis || "").trim().slice(0, 1500);

    let caption = "";
    caption += `> Title: ${titles}\n`;
    caption += `> Type: ${item.type || "N/A"}\n`;
    caption += `> Chapters: ${item.chapters ?? "N/A"}\n`;
    caption += `> Volumes: ${item.volumes ?? "N/A"}\n`;
    caption += `> Status: ${item.status || "N/A"}\n`;
    caption += `> Published: ${item.published?.prop?.from?.year || "N/A"}\n`;
    caption += `> Score: ${score} | Rank: ${rank} | Popularity: ${pop} | Favorites: ${favorites}\n`;
    caption += `> Authors: ${authors || "N/A"}\n`;
    caption += `> Serializations: ${serializations || "N/A"}\n`;
    caption += `> Genres: ${genres || "N/A"}\n`;
    caption += `> Themes: ${themes || "N/A"}\n`;
    caption += `> Demographics: ${demos || "N/A"}\n`;
    caption += `> Synopsis: ${synopsis || "N/A"}`;

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
