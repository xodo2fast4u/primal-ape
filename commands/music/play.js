module.exports = {
  name: "play",
  category: "music",
  run: async (ctx) => {
    const q = (ctx.text || "").trim();
    if (!q) {
      await ctx.reply("> usage: play <song name or YouTube URL>");
      return;
    }

    try {
      const vid = await resolveVideoId(q);
      if (!vid) {
        await ctx.reply("> no results found");
        return;
      }

      const res = await fetch(
        `https://piped.video/api/v1/streams/${encodeURIComponent(vid)}`
      );
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

      await ctx.send({
        audio: { url: best.url },
        mimetype: best.mime,
        fileName,
      });
    } catch (e) {
      await ctx.reply("> failed to play. try again later.");
    }
  },
};

function chooseAudio(audios) {
  const sorted = [...audios].sort(
    (a, b) => (b.bitrate || 0) - (a.bitrate || 0)
  );
  const a = sorted[0];
  const container = (a.container || "").toLowerCase();
  let mime = "audio/mpeg";
  let ext = "mp3";
  if (container.includes("webm")) {
    mime = "audio/webm";
    ext = "webm";
  } else if (container.includes("mp4") || container.includes("m4a")) {
    mime = "audio/mp4";
    ext = "m4a";
  }
  return { url: a.url, mime, ext };
}

async function resolveVideoId(q) {
  const idFromUrl = extractYouTubeId(q);
  if (idFromUrl) return idFromUrl;
  const s = await fetch(
    `https://piped.video/api/v1/search?q=${encodeURIComponent(q)}&region=US`
  );
  const data = await s.json();
  if (!Array.isArray(data) || !data.length) return null;
  const v = data.find((x) => x && x.url) || data[0];
  return parseIdFromPipedUrl(v.url);
}

function extractYouTubeId(u) {
  try {
    const m = String(u).match(
      /(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
    );
    if (m) return m[1].split("&")[0];
    return null;
  } catch {
    return null;
  }
}

function parseIdFromPipedUrl(p) {
  if (!p) return null;
  if (p.includes("watch?v=")) {
    const val = p.split("v=").pop();
    return val.split("&")[0];
  }
  const parts = p.split("/");
  return parts.pop() || null;
}

function sanitize(s) {
  return s.replace(/[\\/:*?"<>|]/g, "_");
}
