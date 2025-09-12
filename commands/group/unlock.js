module.exports = {
  name: "unlock",
  category: "group",
  run: async (ctx) => {
    await ctx.sock.groupSettingUpdate(ctx.chatId, "not_announcement");
    await ctx.reply("🔓 Group is now open for all members.");
  },
};
