const { resolveVideoId, chooseAudio, sanitize } = require("./play");

module.exports = {
  name: "download",
  category: "music",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("> usage: download <song name or YouTube URL>");
      return;
    }

    try {
      const vid = await resolveVideoId(q);
      if (!vid) {
        await ctx.reply("> no matching video found");
        return;
      }

      const res = await fetch(
        `https://piped.video/api/v1/streams/${encodeURIComponent(vid)}`
      );
      if (!res.ok) {
        await ctx.reply("> failed to fetch streams");
        return;
      }

      const json = await res.json();
      const audios = Array.isArray(json.audioStreams) ? json.audioStreams : [];
      if (!audios.length) {
        await ctx.reply("> no audio streams available");
        return;
      }

      const best = chooseAudio(audios);
      const title = json.title || "audio";
      const fileExt = best.ext || "mp3";
      const fileName = sanitize(`${title}.${fileExt}`);

      const sizeMB = best.size ? Number(best.size) / (1024 * 1024) : null;
      if (sizeMB && sizeMB > 95) {
        await ctx.reply("> audio too large to send (>95 MB)");
        return;
      }

      await ctx.send({
        document: { url: best.url },
        mimetype: best.mime,
        fileName,
        caption: `🎵 ${title}`,
      });
    } catch (err) {
      await ctx.reply("> failed to download audio");
    }
  },
};
