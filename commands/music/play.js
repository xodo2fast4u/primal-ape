const ytdl = require("@distube/ytdl-core");
const ytSearch = require("yt-search");
const { spawn } = require("child_process");

function transcodeToOggOpus(inputBuffer) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-i",
      "pipe:0",
      "-vn",
      "-acodec",
      "libopus",
      "-ac",
      "1",
      "-ar",
      "48000",
      "-f",
      "ogg",
      "-loglevel",
      "error",
      "pipe:1",
    ]);

    const chunks = [];

    ff.stdout.on("data", (chunk) => chunks.push(chunk));
    ff.stderr.on("data", () => {});
    ff.on("error", (err) => reject(err));

    ff.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffmpeg exited with code ${code}`));
      }
      resolve(Buffer.concat(chunks));
    });

    ff.stdin.write(inputBuffer);
    ff.stdin.end();
  });
}

async function probeDuration(buffer) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      "-i",
      "pipe:0",
    ]);

    let out = "";

    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe exited with code ${code}`));
      }

      const duration = parseFloat(out.trim());
      if (isNaN(duration)) {
        return reject(new Error("ffprobe returned NaN duration"));
      }

      resolve(duration);
    });

    proc.stdin.write(buffer);
    proc.stdin.end();
  });
}

module.exports = {
  name: "play",
  category: "music",
  run: async (ctx) => {
    try {
      const query = ctx.args.join(" ").trim();
      if (!query) {
        return ctx.reply("❌ Usage: !play <song name / artist / link>");
      }

      let videoUrl = null;

      const ytRegex =
        /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([\w-]{11})/;
      const match = query.match(ytRegex);
      if (match) {
        videoUrl = `https://www.youtube.com/watch?v=${match[5]}`;
      }

      if (!videoUrl) {
        let searchQuery = query;
        if (query.includes(" by ")) {
          const [song, artist] = query.split(" by ");
          searchQuery = `${song} ${artist}`;
        }
        const searchRes = await ytSearch(searchQuery);
        if (!searchRes || !searchRes.videos.length) {
          return ctx.reply("⚠️ No results found.");
        }
        videoUrl = searchRes.videos[0].url;
      }

      if (!ytdl.validateURL(videoUrl)) {
        return ctx.reply("❌ Invalid YouTube URL.");
      }

      const stream = ytdl(videoUrl, {
        filter: "audioonly",
        quality: "highestaudio",
        requestOptions: {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        },
      });

      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const inputBuffer = Buffer.concat(chunks);

      const oggBuffer = await transcodeToOggOpus(inputBuffer).catch(
        async (err) => {
          console.error("ffmpeg transcode failed:", err);
          await ctx.reply(
            "⚠️ Failed to convert audio to WhatsApp voice format. " +
              "Make sure ffmpeg is installed on the server."
          );
          throw err;
        }
      );

      let seconds;
      try {
        seconds = await probeDuration(oggBuffer);
      } catch (err) {
        console.warn("Duration probe failed (non‑fatal):", err.message);
      }

      const messageContent = {
        audio: oggBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
      };

      if (typeof seconds === "number" && !isNaN(seconds)) {
        messageContent.seconds = Math.round(seconds);
      }

      await ctx.send(messageContent);
    } catch (err) {
      console.error("play error:", err);

      if (err.message?.includes("Could not extract functions")) {
        await ctx.reply(
          "⚠️ YouTube extraction failed. Please try again later."
        );
      } else if (err.message?.includes("Video unavailable")) {
        await ctx.reply("⚠️ Video is unavailable or private.");
      } else {
        await ctx.reply("⚠️ Failed to fetch or send audio.");
      }
    }
  },
};
