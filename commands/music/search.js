const { parseIdFromPipedUrl, resolveVideoId } = require("./play");

module.exports = {
  name: "search",
  category: "music",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("> usage: search <query>");
      return;
    }

    try {
      const res = await fetch(
        `https://piped.video/api/v1/search?q=${encodeURIComponent(q)}&region=US`
      );
      if (!res.ok) {
        await ctx.reply("> search failed");
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        await ctx.reply("> no results");
        return;
      }

      const top = data.slice(0, 3);
      const lines = top.map((v, i) => {
        const title = v.title || "unknown";
        const channel = v.uploaderName || "unknown";
        const duration = v.duration || "";
        const url = v.url ? toYouTubeUrl(v.url) : "";
        return `${i + 1}. ${title}\n   👤 ${channel}${
          duration ? `\n   ⏱️ ${duration}` : ""
        }${url ? `\n   🔗 ${url}` : ""}`;
      });

      await ctx.reply(`🎧 Results for "${q}":\n\n${lines.join("\n\n")}`);
    } catch (err) {
      await ctx.reply("> search error");
    }
  },
};

function toYouTubeUrl(pipedUrl) {
  if (!pipedUrl) return "";
  if (pipedUrl.startsWith("http")) {
    const id = parseIdFromPipedUrl ? parseIdFromPipedUrl(pipedUrl) : null;
    if (id) return `https://youtu.be/${id}`;
    return pipedUrl;
  }
  if (pipedUrl.startsWith("/watch")) {
    const sp = pipedUrl.split("v=").pop();
    const id = sp.split("&")[0];
    return `https://youtube.com/watch?v=${id}`;
  }
  const id = pipedUrl.split("/").pop();
  return `https://youtu.be/${id}`;
}
