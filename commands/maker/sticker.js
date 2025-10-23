const fs = require("fs");
const { downloadContentFromMessage } = require("baileys");

module.exports = {
  name: "sticker",
  category: "maker",
  run: async (ctx) => {
    try {
      const quoted = ctx.quoted;
      const mime = quoted?.mimetype || "";

      if (!quoted) {
        return ctx.reply("❌ Reply to an image or video (≤10s) with !sticker");
      }

      if (/image/.test(mime)) {
        const media = await quoted.download();
        const encmedia = await ctx.client.sendImageAsSticker(
          ctx.chat,
          media,
          ctx.msg,
          {
            packname: "My Pack",
            author: "My Bot",
          }
        );
        await fs.unlinkSync(encmedia);
        return;
      }

      if (/video/.test(mime)) {
        const duration = (quoted.msg || quoted)?.seconds || 0;
        if (duration > 10) {
          return ctx.reply("⚠️ Video must be 10 seconds or less.");
        }
        const media = await quoted.download();
        const encmedia = await ctx.client.sendVideoAsSticker(
          ctx.chat,
          media,
          ctx.msg,
          {
            packname: "My Pack",
            author: "My Bot",
          }
        );
        await fs.unlinkSync(encmedia);
        return;
      }

      return ctx.reply("❌ Only images or short videos are supported.");
    } catch (err) {
      console.error("sticker error:", err);
      await ctx.reply("⚠️ Failed to convert to sticker.");
    }
  },
};
