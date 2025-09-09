module.exports = {
  name: "status",
  category: "tools",
  run: async (ctx) => {
    try {
      const { sock, msg, text } = ctx;

      const quoted =
        msg.message?.imageMessage || msg.message?.videoMessage
          ? msg
          : msg.quoted;

      if (quoted?.message?.imageMessage) {
        const buffer = await sock.downloadMediaMessage(quoted);
        await sock.sendMessage("status@broadcast", {
          image: buffer,
          caption: text || "",
        });
        return ctx.reply("✅ Image posted to status.");
      }

      if (quoted?.message?.videoMessage) {
        const buffer = await sock.downloadMediaMessage(quoted);
        await sock.sendMessage("status@broadcast", {
          video: buffer,
          caption: text || "",
        });
        return ctx.reply("✅ Video posted to status.");
      }

      if (text) {
        await sock.sendMessage("status@broadcast", { text });
        return ctx.reply("✅ Text status posted.");
      }

      return ctx.reply(
        "❌ Please reply to an image/video or provide text.\nUsage:\n!status some text\n(reply to media with !status)"
      );
    } catch (err) {
      console.error("Status error:", err.message);
      ctx.reply("❌ Failed to post status.");
    }
  },
};
