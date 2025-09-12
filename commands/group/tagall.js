module.exports = {
  name: "tagall",
  category: "group",
  run: async (ctx) => {
    if (!ctx.isGroup) {
      return await ctx.reply("❌ This command only works in groups.");
    }

    const metadata = await ctx.getGroupMetadata(ctx.chatId);
    const participants = metadata.participants || [];

    const mentions = participants.map((p) => p.id);
    const list = participants
      .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
      .join("\n");

    await ctx.sendMessage(ctx.chatId, {
      text: `📢 *TAG ALL*\n\n${list}`,
      mentions,
    });
  },
};
