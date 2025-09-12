module.exports = {
  name: "hidetag",
  category: "group",
  run: async (ctx) => {
    try {
      const text = ctx.args.length ? ctx.args.join(" ") : "👀";

      if (!ctx.isGroup) {
        return await ctx.reply("❌ This command only works in groups.");
      }

      const metadata = await ctx.getGroupMetadata(ctx.chatId);
      const participants = metadata.participants || [];

      const mentions = participants.map((p) => p.id);

      await ctx.sendMessage(ctx.chatId, {
        text: text + "\u200E",
        mentions,
      });
    } catch (err) {
      console.error("hidetag error:", err);
      await ctx.reply("⚠️ Failed to run hidetag command.");
    }
  },
};
