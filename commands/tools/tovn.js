module.exports = {
  name: "tovn",
  category: "tools",
  run: async (ctx) => {
    try {
      const msg = ctx.msg;
      const quoted = ctx.quoted?.message || msg.message;

      if (!quoted) {
        return ctx.reply("❌ Reply to an audio or video with !tovn");
      }

      let buffer = null;

      if (quoted.audioMessage) {
        buffer = await ctx.sock.downloadMediaMessage({
          key: msg.key,
          message: quoted,
        });
      }

      if (quoted.videoMessage) {
        buffer = await ctx.sock.downloadMediaMessage({
          key: msg.key,
          message: quoted,
        });
      }

      if (!buffer) {
        return ctx.reply("⚠️ Only audio or video files are supported.");
      }

      await ctx.send({
        audio: buffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
      });
    } catch (err) {
      console.error("tovn error:", err);
      await ctx.reply("⚠️ Failed to convert to voice note.");
    }
  },
};
